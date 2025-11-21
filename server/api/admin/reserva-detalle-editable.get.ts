import { db } from '../../utils/prisma';
import { createError } from 'h3'; 

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const idReserva = query.id_reserva as string;

    if (!idReserva) {
        throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la reserva.' });
    }

    try {
        const reservaDetalle = await db.reserva.findUnique({
            where: { id_reserva: parseInt(idReserva) },
            include: {
                pedido: { 
                    include: {
                        usuario: true, 
                        // INCLUIR PRODUCTOS COMPRADOS
                        detalles_pedido: { 
                            include: { producto: true } 
                        },
                    }
                },
                detalle_reserva: true,
            }
        });

        if (!reservaDetalle || !reservaDetalle.pedido) {
            throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada o pedido asociado faltante.' });
        }
        
        // --- 1. Obtener Datos de la Mascota ---
        let mascotaData = null;
        if (reservaDetalle.pedido.usuario.id_usuario) {
            // Buscamos la mascota más reciente asociada al usuario (la que se creó con el servicio)
            const mascotas = await db.mascota.findMany({
                where: { id_usuario: reservaDetalle.pedido.usuario.id_usuario },
                orderBy: { id_mascota: 'desc' },
                take: 1
            });
            if (mascotas.length > 0) {
                mascotaData = {
                    nombre: mascotas[0].nombre_mascota,
                    peso: mascotas[0].peso?.toNumber() || 0, // Convertir Decimal a number
                    edad: mascotas[0].edad,
                };
            }
        }

        // --- 2. Obtener Productos Comprados ---
        const productosComprados = reservaDetalle.pedido.detalles_pedido.map(detalle => ({
            nombre: detalle.producto?.nombre_producto || 'Ítem Desconocido',
            cantidad: detalle.cantidad,
            precio: detalle.precio_unitario.toNumber(), // Convertir Decimal a number
        }));

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
            
            // Nombre del Servicio
            nombre_servicio: reservaDetalle.detalle_reserva?.nombre_servicio || 'N/A',
            tipo_servicio: reservaDetalle.detalle_reserva?.tipo_servicio || 'N/A',
            
            region: reservaDetalle.region,
            comuna: reservaDetalle.comuna,
            direccion: reservaDetalle.direccion,

            // NUEVOS DATOS
            mascota_datos: mascotaData,
            productos_comprados: productosComprados,
        };

    } catch (error: any) {
        console.error('Error al obtener detalle de reserva:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al cargar la reserva. Revise logs del servidor.'
        });
    }
});