// server/api/admin/editar-reserva.put.ts
import { db } from '../../utils/prisma';

/**
 * API para ACTUALIZAR (PUT) un pedido/reserva existente.
 * Ruta: /api/admin/editar-reserva
 * Método: PUT
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { 
      id: pedidoId, 
      estadoPedido,  // "Pendiente", "Pagado", "Cancelado"
      estadoReserva, // "Pendiente", "Confirmada", "En Proceso", "Finalizada"
      codTrazabilidad 
    } = body;

    if (!pedidoId) {
      throw createError({ statusCode: 400, statusMessage: 'ID de pedido no proporcionado.' });
    }

    // 1. Encontrar el Pedido para obtener el ID del pago
    const pedido = await db.pedido.findUnique({
      where: { id_pedido: Number(pedidoId) },
      select: { id_pago: true, reserva: { select: { id_reserva: true }} }
    });

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    }
    
    // 2. Determinar el estado del PAGO basado en el estado del PEDIDO
    let estadoPagoFinal = 'Pendiente';
    if (estadoPedido === 'Pagado') {
      estadoPagoFinal = 'Pagado';
    } else if (estadoPedido === 'Cancelado') {
      estadoPagoFinal = 'Fallido'; // o 'Cancelado', según tu lógica
    }

    // 3. Usar una transacción
    await db.$transaction([
      
      // Op 1: Actualizar el Pedido
      db.pedido.update({
        where: { id_pedido: Number(pedidoId) },
        data: {
          estado_pedido: estadoPedido,
        },
      }),

      // Op 2: Actualizar el Pago
      db.pago.update({
        where: { id_pago: pedido.id_pago! }, // Usamos el id_pago del pedido
        data: {
          estado: estadoPagoFinal,
        },
      }),

      // Op 3: Actualizar la Reserva (si existe)
      db.reserva.update({
        where: { id_reserva: pedido.reserva!.id_reserva }, // Usamos el id_reserva
        data: {
          estado_reserva: estadoReserva,
          cod_trazabilidad: codTrazabilidad,
        },
      }),
    ]);

    // 4. Éxito
    return {
      statusCode: 200,
      message: 'Reserva (Pedido) actualizada exitosamente.',
    };

  } catch (error: any) {
    console.error("Error al actualizar la reserva:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al actualizar la reserva.',
    });
  }
});