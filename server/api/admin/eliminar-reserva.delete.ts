// server/api/admin/eliminar-reserva.delete.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const idParam = query.id as string;

    if (!idParam) {
        throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la reserva a eliminar.' });
    }
    const idReserva = parseInt(idParam);

    try {
        // Usa una transacción para asegurar que todas las entradas relacionadas se eliminen
        const result = await db.$transaction(async (tx) => {
            
            // 1. Obtener el ID del pedido y detalle_reserva asociado
            const reserva = await tx.reserva.findUnique({
                where: { id_reserva: idReserva },
                select: { id_pedido: true, id_detalle_reserva: true }
            });

            if (!reserva) {
                // No se lanza un 404 para evitar que la transacción falle completamente,
                // pero se devuelve un error de tipo para control.
                return 'NOT_FOUND'; 
            }

            // 2. Eliminar la reserva
            await tx.reserva.delete({
                where: { id_reserva: idReserva }
            });
            
            // 3. Eliminar el Detalle_Reserva asociado (si existe y si no está en CASCADE)
            if (reserva.id_detalle_reserva) {
                await tx.detalle_Reserva.delete({
                    where: { id_detalle_reserva: reserva.id_detalle_reserva }
                });
            }

            // 4. Eliminar el Pedido.
            // Esto debería eliminar DetallePedido, Pago y Envio anidados vía CASCADE en Prisma.
            if (reserva.id_pedido) {
                await tx.pedido.delete({
                    where: { id_pedido: reserva.id_pedido }
                });
            }

            return 'DELETED';
        });
        
        if (result === 'NOT_FOUND') {
             throw createError({ statusCode: 404, statusMessage: `Reserva #${idReserva} no encontrada.` });
        }


        return {
            statusCode: 200,
            message: `Reserva #${idReserva} y pedido asociado eliminados correctamente.`
        };

    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        // El error 500 debe ser revisado en los logs del servidor
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al eliminar la reserva. Verifique la configuración CASCADE en el esquema Prisma.'
        });
    }
});