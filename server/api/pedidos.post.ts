// server/api/admin/pedidos.post.ts (o el archivo que uses para la creación)
import { db } from '../utils/prisma';
import { defineEventHandler, readBody, createError } from 'h3';

// ... (Las interfaces Dirección, CartItem, PedidoBody se mantienen igual) ...

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<PedidoBody>(event);
        // ... (Validaciones iniciales se mantienen) ...
        
        const { id_usuario, cart, metodo_pago } = body;
        const itemsProductos = cart.filter(i => i.tipo !== 'Servicio');
        const servicio = cart.find(i => i.tipo === 'Servicio');

        let totalBase = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        const costoAdicional = cart[0]?.costo_adicional || 0; 
        const totalGeneralString = String(totalBase + costoAdicional); 
        
        const logistica = cart[0]?.direccion;
        const esEnvioDomicilio = !servicio && logistica?.tipo_entrega === 'DOMICILIO';
        const estadoInicial = 'Pendiente'; // Estado por defecto para Pedido/Pago/Reserva

        // ... (Preparación de detallesProducto y Mascota se mantiene) ...
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
                    peso: servicio.petWeight ? Number(servicio.petWeight) : undefined, 
                    edad: servicio.petAge ? Number(servicio.petAge) : undefined, 
                    id_usuario: id_usuario, 
                }
            });
        }
        
        // --- TRANSACCIÓN CON EL PAGO AÑADIDO ---
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
            
            // 🔥 CORRECCIÓN CLAVE: 2. CREAR EL PAGO
            const pago = await tx.pago.create({
                data: {
                    nombre_metodo: metodo_pago,
                    monto: totalGeneralString,
                    estado: estadoInicial, 
                }
            });

            // 3. Crear el Pedido (con Pago, Reserva y Envio anidados)
            const pedido = await tx.pedido.create({
                data: {
                    id_usuario,
                    id_pago: pago.id_pago, // <--- ¡AQUÍ ESTÁ EL ENLACE AL PAGO!
                    precio_total: totalGeneralString,
                    estado_pedido: estadoInicial, 
                    es_reserva: !!servicio, // OK: true si hay servicio, false si solo hay productos.
                    
                    detalles_pedido: { create: detallesProducto },
                    
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

                    envio: esEnvioDomicilio && logistica ? {
                        create: {
                            region_envio: logistica.region,
                            comuna_envio: logistica.comuna,
                            direccion_envio: logistica.direccion,
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