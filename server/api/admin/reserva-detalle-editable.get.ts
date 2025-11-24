// server/api/admin/reserva-detalle-editable.get.ts
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
        const reservaDetalle = await db.reserva.findUnique({
            where: { id_reserva: idReserva }, 
            include: {
                pedido: { 
                    include: {
                        usuario: true, 
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
            // Buscamos la mascota más reciente asociada al usuario
            const mascotas = await db.mascota.findMany({
                where: { id_usuario: reservaDetalle.pedido.usuario.id_usuario },
                orderBy: { id_mascota: 'desc' },
                take: 1
            });
            if (mascotas.length > 0) {
                // 🔥 CORRECCIÓN 1: Manejo seguro de Decimal (peso) y nulos (edad)
                mascotaData = {
                    nombre: mascotas[0].nombre_mascota || 'N/A', 
                    peso: mascotas[0].peso?.toNumber() ?? null, // Convertir a number, o null
                    edad: mascotas[0].edad ?? null, // Usar ?? null para devolver null si es undefined/null
                };
            }
        }

        // --- 2. Obtener Productos Comprados ---
        const productosComprados = reservaDetalle.pedido.detalles_pedido.map(detalle => ({
            nombre: detalle.producto?.nombre_producto || 'Ítem Desconocido',
            cantidad: detalle.cantidad,
            // 🔥 CORRECCIÓN 2: Conversión segura de Decimal a number
            precio: detalle.precio_unitario?.toNumber() ?? 0, 
        }));

        // --- 3. Formatear la Respuesta ---
        const fechaReservada = reservaDetalle.fecha_reservada;
        const fechaReservadaISO = fechaReservada?.toISOString().split('T')[0] || '';
        const horaReservadaISO = fechaReservada ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(fechaReservada) : '';
        
        // 🔥 CORRECCIÓN 3: Conversión segura de Decimal (precio_total)
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
            
            nombre_servicio: reservaDetalle.detalle_reserva?.nombre_servicio || 'N/A',
            tipo_servicio: reservaDetalle.detalle_reserva?.tipo_servicio || 'N/A',
            
            region: reservaDetalle.region,
            comuna: reservaDetalle.comuna,
            direccion: reservaDetalle.direccion,

            mascota_datos: mascotaData,
            productos_comprados: productosComprados,
        };

    } catch (error: any) {
        console.error('Error al obtener detalle de reserva (CRITICO):', error);
        // Aseguramos que el error 500 se lanza correctamente
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al cargar la reserva. Revise logs del servidor.'
        });
    }
});