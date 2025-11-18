// server/api/admin/editar-reserva.put.ts
import { db } from '../../utils/prisma';

/**
 * API para ACTUALIZAR (PUT) un pedido/reserva existente.
 * Ruta: /api/admin/editar-reserva
 * Método: PUT
 */
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${out.substring(0,3)}-${out.substring(3,8)}`;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      id: pedidoId,
      estadoPedido,
      estadoReserva,
      codTrazabilidad,
      fechaReservada,
      horaReservada
    } = body;

    if (!pedidoId) {
      throw createError({ statusCode: 400, statusMessage: 'ID de pedido no proporcionado.' });
    }

    // Buscar pedido con pago y reserva relacionados
    const pedido = await db.pedido.findUnique({
      where: { id_pedido: Number(pedidoId) },
      select: { id_pago: true, reserva: { select: { id_reserva: true, cod_trazabilidad: true } } }
    });

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    }

    await db.$transaction(async (tx) => {
      // 1) Actualizar pedido si viene estadoPedido
      if (estadoPedido !== undefined) {
        await tx.pedido.update({
          where: { id_pedido: Number(pedidoId) },
          data: { estado_pedido: estadoPedido || undefined }
        });
      }

      // 2) Actualizar pago si existe
      if (pedido.id_pago) {
        let estadoPagoFinal = undefined;
        if (estadoPedido === 'Pagado') estadoPagoFinal = 'Pagado';
        else if (estadoPedido === 'Cancelado') estadoPagoFinal = 'Fallido';
        if (estadoPagoFinal) {
          await tx.pago.update({
            where: { id_pago: Number(pedido.id_pago) },
            data: { estado: estadoPagoFinal }
          });
        }
      }

      // 3) Actualizar reserva si existe
      if (pedido.reserva && pedido.reserva.id_reserva) {
        const updateData: any = {};

        if (estadoReserva !== undefined) updateData.estado_reserva = estadoReserva;
        // cod_trazabilidad: si viene en body lo usamos; si no viene y se asignó fecha y no hay código, generamos uno.
        if (codTrazabilidad !== undefined) {
          updateData.cod_trazabilidad = codTrazabilidad || null;
        } else if ((fechaReservada || horaReservada) && !pedido.reserva.cod_trazabilidad) {
          updateData.cod_trazabilidad = generateTrackingCode();
        }

        if (fechaReservada) updateData.fecha_reservada = new Date(fechaReservada);
        if (horaReservada) {
          // Si el admin envía solo hora (HH:mm) intentamos combinarlas adecuadamente. Guardamos como Date ISO for DB.
          // Best-effort: if fechaReservada provided use that date + hora; else set hora as today + time.
          const datePart = fechaReservada ? new Date(fechaReservada) : new Date();
          const [hh, mm] = String(horaReservada).split(':').map(Number);
          if (!isNaN(hh) && !isNaN(mm)) {
            datePart.setHours(hh, mm, 0, 0);
            updateData.hora_reservada = datePart;
          }
        }

        await tx.reserva.update({
          where: { id_reserva: pedido.reserva.id_reserva },
          data: updateData
        });
      }
    });

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
