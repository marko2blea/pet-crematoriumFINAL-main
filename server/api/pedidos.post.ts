import { db } from '../utils/prisma';
import { createError } from 'h3';

// Definiciones de tipos necesarias para este endpoint
interface Direccion { 
    region: string; 
    comuna: string; 
    direccion: string; 
    tipo_entrega: 'DOMICILIO' | 'RETIRO'; 
}
interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    quantity: number;
    tipo: 'Producto' | 'Servicio' | 'Urna' | 'Accesorio'; 
    petName?: string;
    petWeight?: number;
    petAge?: number;
    direccion?: Direccion;
    costo_adicional?: number;
}
interface PedidoBody {
    id_usuario: number;
    cart: CartItem[];
    metodo_pago: string;
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<PedidoBody>(event);
        if (!body || !body.cart || body.cart.length === 0 || !body.id_usuario) {
            throw createError({ statusCode: 400, statusMessage: 'Datos faltantes (id_usuario o carrito vacío).' });
        }

        const { id_usuario, cart, metodo_pago } = body;
        const itemsProductos = cart.filter(i => i.tipo !== 'Servicio');
        const servicio = cart.find(i => i.tipo === 'Servicio');

        let totalBase = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        const costoAdicional = cart[0]?.costo_adicional || 0; 
        const totalGeneral = totalBase + costoAdicional;
        
        const logistica = cart[0]?.direccion;
        const esEnvioDomicilio = !servicio && logistica?.tipo_entrega === 'DOMICILIO';

        // --- PREPARAR DATOS ---
        const detallesProducto = itemsProductos.map(p => ({
            cod_producto: p.id,
            cantidad: p.quantity,
            precio_unitario: p.precio,
        }));
        
        let mascotaCreationPromise = null;
        if (servicio && servicio.petName) {
            mascotaCreationPromise = db.mascota.create({
                data: {
                    nombre_mascota: servicio.petName,
                    peso: servicio.petWeight,
                    edad: servicio.petAge,
                    id_usuario: id_usuario, 
                }
            });
        }
        
        // --- TRANSACCIÓN PARA ENLACE DE ID ---
        const results = await db.$transaction(async (tx) => {
            let idDetalleReserva: number | undefined = undefined;

            // 1. Crear Detalle_Reserva si hay Servicio (para obtener el ID y el nombre)
            if (servicio) {
                const detalleReserva = await tx.detalle_reserva.create({
                    data: {
                        nombre_servicio: servicio.nombre,
                        precio_servicio: servicio.precio,
                        tipo_servicio: servicio.tipo,
                        cantidad: servicio.quantity,
                        precio_total: servicio.precio * servicio.quantity,
                    }
                });
                idDetalleReserva = detalleReserva.id_detalle_reserva;
            }

            // 2. Crear Mascota si aplica (no se usa el resultado aquí, solo se asegura la creación)
            if (mascotaCreationPromise) await mascotaCreationPromise;

            // 3. Crear el Pedido (con Reserva y Envio anidados)
            const pedido = await tx.pedido.create({
                data: {
                    id_usuario,
                    precio_total: totalGeneral,
                    estado_pedido: 'Pendiente',
                    es_reserva: !!servicio,
                    
                    detalles_pedido: { create: detallesProducto },
                    
                    reserva: servicio ? {
                        create: {
                            precio_total: totalGeneral, 
                            estado_reserva: 'Pendiente',
                            region: logistica?.region,
                            comuna: logistica?.comuna,
                            direccion: logistica?.direccion,
                            id_detalle_reserva: idDetalleReserva, // VINCULACIÓN CLAVE
                        }
                    } : undefined,

                    envio: esEnvioDomicilio && logistica ? {
                        create: {
                            region_envio: logistica.region,
                            comuna_envio: logistica.comuna,
                            direccion_envio: logistica.direccion,
                            estado_envio: 'Pendiente',
                        }
                    } : undefined,
                },
                include: {
                    reserva: true,
                }
            });

            return pedido;
        });

        // El resultado es el Pedido creado (results en este contexto)
        const pedido = results;

        return {
            statusCode: 201, 
            message: 'Pedido creado correctamente',
            id_pedido: pedido.id_pedido, 
            cod_trazabilidad: pedido.reserva?.cod_trazabilidad || null
        };

    } catch (error) {
        console.error('Error en /api/pedidos:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al procesar el pedido. Revise logs del servidor.'
        });
    }
});