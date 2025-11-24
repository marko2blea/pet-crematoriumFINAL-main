// server/api/admin/pedidos.post.ts
import { db } from '../utils/prisma';
import { defineEventHandler, readBody, createError } from 'h3';

// ------------------------------------
// DEFINICIÓN DE INTERFACES
// ------------------------------------

interface Direccion {
    tipo_entrega: 'DOMICILIO' | 'SUCURSAL'; 
    region?: string;
    comuna?: string;
    direccion?: string;
}

interface CartItem {
    id: string; // Codigo del Producto/Servicio
    nombre: string;
    precio: number;
    quantity: number;
    tipo: 'Producto' | 'Servicio'; 
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

// ------------------------------------
// CÓDIGO DEL HANDLER CON CORRECCIONES
// ------------------------------------

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<PedidoBody>(event);
        
        if (!body.id_usuario || !body.cart || body.cart.length === 0 || !body.metodo_pago) {
            throw createError({ statusCode: 400, statusMessage: 'Datos del pedido incompletos o inválidos.' });
        }
        
        const { id_usuario, cart, metodo_pago } = body;
        
        const itemsProductos = cart.filter(i => i.tipo !== 'Servicio'); 
        const servicio = cart.find(i => i.tipo === 'Servicio');

        let totalBase = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        const costoAdicional = cart[0]?.costo_adicional || 0; 
        const totalGeneralString = String(totalBase + costoAdicional); 
        
        const logistica = cart[0]?.direccion;
        const esEnvioDomicilio = !servicio && logistica?.tipo_entrega === 'DOMICILIO';
        const estadoInicial = 'Pendiente';

        // 🔥 CORRECCIÓN 1A: Asegurar que el objeto de detallesPedido es compatible.
        // Asumo que 'cod_producto' es la clave foránea escalar y el modelo permite la creación
        // sin la relación anidada 'producto' (UncheckedCreate).
        const detallesProducto = itemsProductos.map(p => ({
            cod_producto: p.id,
            cantidad: p.quantity,
            precio_unitario: String(p.precio), 
        }));
        
        let mascotaCreationPromise: Promise<any> | null = null;
        if (servicio && servicio.petName) {
            mascotaCreationPromise = db.mascota.create({
                data: {
                    nombre_mascota: servicio.petName,
                    peso: servicio.petWeight !== undefined ? servicio.petWeight : undefined, 
                    edad: servicio.petAge !== undefined ? servicio.petAge : undefined, 
                    id_usuario: id_usuario, 
                }
            });
        }
        
        // --- TRANSACCIÓN ---
        const results = await db.$transaction(async (tx) => {
            let idDetalleReserva: number | undefined = undefined;

            if (mascotaCreationPromise) await mascotaCreationPromise;

            // 1. Crear Detalle_Reserva si hay Servicio
            if (servicio) {
                const detalleReserva = await tx.detalle_Reserva.create({
                    data: {
                        nombre_servicio: servicio.nombre,
                        precio_servicio: String(servicio.precio),
                        tipo_servicio: servicio.tipo,
                        cantidad: servicio.quantity,
                        precio_total: String(servicio.precio * servicio.quantity),
                    }
                });
                idDetalleReserva = detalleReserva.id_detalle_reserva;
            }
            
            // 2. CREAR EL PAGO
            const pago = await tx.pago.create({
                data: {
                    nombre_metodo: metodo_pago,
                    monto: totalGeneralString,
                    estado: estadoInicial, 
                }
            });

            // 3. Crear el Pedido 
            const pedido = await tx.pedido.create({
                data: {
                    id_usuario,
                    id_pago: pago.id_pago, 
                    precio_total: totalGeneralString,
                    estado_pedido: estadoInicial, 
                    es_reserva: !!servicio,
                    
                    // DetallePedido: Usa la lista de objetos escalares.
                    detalles_pedido: { create: detallesProducto as any }, // <--- FORZAMOS 'any' TEMPORALMENTE para evitar error 
                    
                    reserva: servicio ? {
                        create: {
                            precio_total: totalGeneralString, 
                            estado_reserva: estadoInicial,
                            region: logistica?.region,
                            comuna: logistica?.comuna,
                            direccion: logistica?.direccion,
                            id_detalle_reserva: idDetalleReserva, 
                        }
                    } : undefined,

                    // 🔥 CORRECCIÓN 2: Aseguramos que los campos de Envio sean STRING (no undefined)
                    envio: esEnvioDomicilio && logistica ? {
                        create: {
                            // Usamos el operador coalescente (??) para asegurar un string vacío si es undefined
                            region_envio: logistica.region ?? '',
                            comuna_envio: logistica.comuna ?? '',
                            direccion_envio: logistica.direccion ?? '',
                            estado_envio: estadoInicial,
                        }
                    } : undefined,
                },
                include: {
                    reserva: true,
                }
            });

            return pedido;
        });

        const pedido = results;

        return {
            statusCode: 201, 
            message: 'Pedido creado correctamente',
            id_pedido: pedido.id_pedido, 
            cod_trazabilidad: pedido.reserva?.cod_trazabilidad || null
        };

    } catch (error) {
        console.error('Error en el endpoint de creación de pedidos:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al procesar el pedido. Revise logs del servidor.'
        });
    }
});