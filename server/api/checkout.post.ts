import { db } from '../utils/prisma';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { idPedido, pagoExitoso } = body;

    if (!idPedido) throw createError({ statusCode: 400, statusMessage: 'Falta ID de pedido.' });

    // Buscar pedido y relación
    const pedido = await db.pedido.findUnique({
      where: { id_pedido: Number(idPedido) },
      include: { pago: true, reserva: true },
    });
    if (!pedido) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });

    await db.$transaction(async (tx) => {
      // 1. Actualizar pago
      if (pedido.pago && pagoExitoso) {
        await tx.pago.update({
          where: { id_pago: pedido.pago.id_pago },
          data: { estado: 'Pagado' },
        });
      }

      // 2. Actualizar pedido
      if (pagoExitoso) {
        await tx.pedido.update({
          where: { id_pedido: Number(idPedido) },
          data: { estado_pedido: 'Pagado' },
        });
      }

      // 3. Actualizar reserva si existe
      if (pedido.reserva) {
        await tx.reserva.update({
          where: { id_reserva: pedido.reserva.id_reserva },
          data: {
            estado_reserva: pagoExitoso ? 'Confirmada' : pedido.reserva.estado_reserva,
            cod_trazabilidad: pedido.reserva.cod_trazabilidad || nanoid(8).toUpperCase(),
          },
        });
      }
    });

    return {
      statusCode: 200,
      message: 'Checkout completado correctamente.',
    };
  } catch (error: any) {
    console.error('Error en checkout:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error al procesar el checkout.' });
  }
});
