import { db } from '../../utils/prisma';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const idParam = query.id as string;

    if (!idParam) {
        throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la reserva (query parameter "id").' });
    }

    const idReserva = parseInt(idParam);
    if (isNaN(idReserva) || idReserva < 1) {
        throw createError({ statusCode: 400, statusMessage: 'ID de reserva inválido.' });
    }

    try {
        // Carga la Reserva, el Pedido, el Usuario y los Detalles del Pedido
        const reservaDetalle = await db.reserva.findUnique({
            where: { id_reserva: idReserva },
            include: {
                pedido: {
                    include: {
                        usuario: true,
                        detalles_pedido: {
                            // Incluimos el producto para obtener su nombre y tipo
                            include: { producto: true }
                        },
                    }
                },
                // Incluimos el detalle principal de la reserva (el servicio)
                detalle_reserva: true,
            }
        });

        if (!reservaDetalle || !reservaDetalle.pedido) {
            throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada o pedido asociado faltante.' });
        }
       
        // --- 1. Obtener Datos de la Mascota ---
        let mascotaData = null;
        if (reservaDetalle.pedido.usuario.id_usuario) {
            // Buscamos la mascota más reciente asociada al usuario
            const mascotas = await db.mascota.findMany({
                where: { id_usuario: reservaDetalle.pedido.usuario.id_usuario },
                orderBy: { id_mascota: 'desc' },
                take: 1
            });
            if (mascotas.length > 0) {
                mascotaData = {
                    nombre: mascotas[0].nombre_mascota || 'N/A',
                    peso: mascotas[0].peso?.toNumber() ?? null, 
                    edad: mascotas[0].edad ?? null, 
                };
            }
        }

        // --- 2. UNIFICACIÓN DE ÍTEMS COMPRADOS (SERVICIOS + PRODUCTOS) ---
        const todosLosItems: any[] = [];

        // 2a. Incluir el Servicio Principal (desde detalle_reserva, es el item base)
        if (reservaDetalle.detalle_reserva) {
            todosLosItems.push({
                nombre: reservaDetalle.detalle_reserva.nombre_servicio || 'Servicio Principal',
                cantidad: reservaDetalle.detalle_reserva.cantidad || 1,
                precio: reservaDetalle.detalle_reserva.precio_total?.toNumber() ?? 0,
                tipo: reservaDetalle.detalle_reserva.tipo_servicio,
            });
        }

        // 2b. Incluir Productos/Accesorios (desde detalles_pedido, son los ítems adicionales)
        reservaDetalle.pedido.detalles_pedido.forEach(detalle => {
            // Verificamos que el producto asociado no sea nulo antes de acceder a sus propiedades
            if (detalle.producto) { 
                todosLosItems.push({
                    nombre: detalle.producto.nombre_producto || 'Ítem Desconocido',
                    cantidad: detalle.cantidad,
                    // Calcular el precio total del detalle (unitario * cantidad)
                    precio: (detalle.precio_unitario?.toNumber() ?? 0) * detalle.cantidad, 
                    tipo: detalle.producto.tipo_producto || 'Accesorio/Urna',
                });
            }
        });

        // --- 3. Formatear la Respuesta ---
        const fechaReservada = reservaDetalle.fecha_reservada;
        const fechaReservadaISO = fechaReservada?.toISOString().split('T')[0] || '';
        const horaReservadaISO = fechaReservada ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(fechaReservada) : '';
       
        const precioTotalNumerico = reservaDetalle.pedido.precio_total?.toNumber() ?? 0;

        return {
            id_reserva: reservaDetalle.id_reserva,
            cod_trazabilidad: reservaDetalle.cod_trazabilidad,
            estado_reserva: reservaDetalle.estado_reserva,
            fecha_reservada: fechaReservadaISO,
            hora_reservada: horaReservadaISO,
            precio_total: precioTotalNumerico,
           
            nombre_cliente: reservaDetalle.pedido.usuario.nombre || 'Desconocido',
            correo_cliente: reservaDetalle.pedido.usuario.correo || 'N/A',
           
            region: reservaDetalle.region,
            comuna: reservaDetalle.comuna,
            direccion: reservaDetalle.direccion,

            mascota_datos: mascotaData,
            // Devolvemos la lista unificada de servicios, urnas y accesorios
            productos_comprados: todosLosItems,
        };

    } catch (error: any) {
        console.error('Error al obtener detalle de reserva (CRITICO):', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al cargar la reserva. Revise logs del servidor.'
        });
    }
});