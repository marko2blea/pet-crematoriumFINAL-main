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
                        detalles_pedido: { include: { producto: true } },
                    }
                },
                detalle_reserva: true
            }
        });

        if (!reservaDetalle) {
            throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada.' });
        }
        
        // Manejo y formateo de fechas
        const fechaReservada = reservaDetalle.fecha_reservada;
        const fechaReservadaISO = fechaReservada?.toISOString().split('T')[0] || '';
        const horaReservadaISO = fechaReservada ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(fechaReservada) : '';

        // ACCESO Y CONVERSIÓN CRÍTICA: Acceso seguro a precio_total desde 'pedido' y conversión.
        const precioTotalNumerico = reservaDetalle.pedido?.precio_total?.toNumber() ?? 0;


        return {
            id_reserva: reservaDetalle.id_reserva,
            cod_trazabilidad: reservaDetalle.cod_trazabilidad,
            estado_reserva: reservaDetalle.estado_reserva,
            fecha_reservada: fechaReservadaISO, 
            hora_reservada: horaReservadaISO, 
            precio_total: precioTotalNumerico, 
            
            // Datos del Usuario
            nombre_cliente: reservaDetalle.pedido?.usuario?.nombre || 'Desconocido',
            correo_cliente: reservaDetalle.pedido?.usuario?.correo || 'N/A',

            // Datos de la Reserva
            nombre_servicio: reservaDetalle.detalle_reserva?.nombre_servicio || 'N/A',
            tipo_servicio: reservaDetalle.detalle_reserva?.tipo_servicio || 'N/A',

            // Datos de la Dirección
            region: reservaDetalle.region,
            comuna: reservaDetalle.comuna,
            direccion: reservaDetalle.direccion,
            id_pedido: reservaDetalle.id_pedido
        };

    } catch (error: any) {
        console.error('Error al obtener detalle de reserva:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al cargar la reserva. Revise logs del servidor.'
        });
    }
});