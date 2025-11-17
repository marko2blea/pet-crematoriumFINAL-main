// server/api/admin/eliminar-reserva.delete.ts
import { db } from '../../utils/prisma';

/**
 * API para ELIMINAR (DELETE) un Pedido completo (Pedido, Pago, Detalle, Reserva/Envio).
 * Ruta: /api/admin/eliminar-reserva
 * Método: DELETE
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id: pedidoId } = body; // Este es el id_pedido

    if (!pedidoId || isNaN(Number(pedidoId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de pedido no válido o no proporcionado.',
      });
    }

    // 1. Encontrar el pedido para obtener el ID del pago
    const pedido = await db.pedido.findUniqueOrThrow({
      where: { id_pedido: Number(pedidoId) },
      select: { id_pago: true },
    });

    // 2. Usar una transacción para eliminar todo
    // Gracias al 'onDelete: Cascade' en tu schema, solo necesitamos
    // borrar el Pedido y el Pago (ya que Pago no tiene cascade)
    await db.$transaction([
      
      // A. Eliminar el Pedido (esto eliminará DetallePedido, Reserva y Envio)
      db.pedido.delete({
        where: { id_pedido: Number(pedidoId) },
      }),
      
      // B. Eliminar el Pago asociado (si existe)
      db.pago.delete({
        where: { id_pago: pedido.id_pago ?? 0 },
      }),
    ]);

    return { 
      statusCode: 200, 
      message: 'Pedido eliminado exitosamente (incluyendo pago, detalles y reserva/envío).' 
    };

  } catch (error: any) {
    console.error("Error al eliminar el pedido:", error);
    if (error.code === 'P2025') {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Error: No se encontró el pedido o sus componentes.' 
      });
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al eliminar el pedido.' 
    });
  }
});