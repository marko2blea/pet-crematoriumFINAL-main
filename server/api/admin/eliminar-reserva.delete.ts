// server/api/admin/eliminar-reserva.delete.ts
import { db } from '../../utils/prisma';

/**
 * API para ELIMINAR o MARCAR COMO PAGADO un Pedido/Reserva.
 * Ruta: /api/admin/eliminar-reserva
 * Método: DELETE
 *
 * Body esperado (JSON):
 * {
 *   id: number,                 // id_pedido
 *   action?: 'delete' | 'markPaid'  // 'delete' por defecto
 * }
 *
 * - action = 'delete' : elimina pedido, reserva, detalle_reserva y pago (transaccional).
 * - action = 'markPaid': marca pago/pedido/reserva como 'Pagado' y genera cod_trazabilidad si falta.
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
    const pedidoId = body?.id ?? (getQuery(event).id ? Number(getQuery(event).id) : undefined);
    const action: 'delete' | 'markPaid' = body?.action ?? 'delete';

    if (!pedidoId || isNaN(Number(pedidoId))) {
      throw createError({ statusCode: 400, statusMessage: 'ID de pedido no válido o no proporcionado.' });
    }

    // 1) Obtener información necesaria del pedido/reserva
    const pedido = await db.pedido.findUnique({
      where: { id_pedido: Number(pedidoId) },
      select: {
        id_pedido: true,
        id_pago: true,
        reserva: {
          select: {
            id_reserva: true,
            id_detalle_reserva: true,
            cod_trazabilidad: true
          }
        }
      }
    });

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    }

    // ---------- ACCION: marcar como pagado ----------
    if (action === 'markPaid') {
      // transacción: actualizar pago, pedido y reserva (si existen)
      const txResult = await db.$transaction(async (tx) => {
        const ops: any[] = [];

        // 1. Actualizar Pago (si existe)
        if (pedido.id_pago) {
          ops.push(tx.pago.update({
            where: { id_pago: Number(pedido.id_pago) },
            data: { estado: 'Pagado', fecha_pago: new Date() }
          }));
        }

        // 2. Actualizar Pedido
        ops.push(tx.pedido.update({
          where: { id_pedido: Number(pedidoId) },
          data: { estado_pedido: 'Pagado' }
        }));

        // 3. Actualizar Reserva (si existe): marcar 'Pagado', generar cod_trazabilidad si falta
        if (pedido.reserva && pedido.reserva.id_reserva) {
          const updateData: any = { estado_reserva: 'Pagado' };

          if (!pedido.reserva.cod_trazabilidad) {
            updateData.cod_trazabilidad = generateTrackingCode();
          }

          ops.push(tx.reserva.update({
            where: { id_reserva: Number(pedido.reserva.id_reserva) },
            data: updateData
          }));
        }

        return await Promise.all(ops);
      });

      return {
        statusCode: 200,
        message: 'Pedido/Reserva marcado(s) como Pagado correctamente.',
        result: txResult
      };
    }

    // ---------- ACCION: delete ----------
    // Queremos eliminar en orden que no rompa constraints:
    // 1) si existe id_detalle_reserva => eliminar detalle_reserva
    // 2) eliminar pedido (cascade eliminará detalles_pedido, reserva, envio por tu schema)
    // 3) eliminar pago (si existe)
    await db.$transaction(async (tx) => {

      // 1) borrar Detalle_Reserva si existe (no se borra en cascada por diseño)
      if (pedido.reserva && pedido.reserva.id_detalle_reserva) {
        // chequea existencia por si acaso
        const det = await tx.detalle_Reserva.findUnique({
          where: { id_detalle_reserva: Number(pedido.reserva.id_detalle_reserva) },
          select: { id_detalle_reserva: true }
        });
        if (det) {
          await tx.detalle_Reserva.delete({
            where: { id_detalle_reserva: det.id_detalle_reserva }
          });
        }
      }

      // 2) eliminar Pedido (esto, por tu schema, debería cascadar DetallePedido, Reserva y Envio)
      await tx.pedido.delete({
        where: { id_pedido: Number(pedidoId) }
      });

      // 3) eliminar Pago si existe (lo hacemos al final para evitar FK issues)
      if (pedido.id_pago) {
        // Asegurarse que el pago aún exista
        const p = await tx.pago.findUnique({ where: { id_pago: Number(pedido.id_pago) }, select: { id_pago: true } });
        if (p) {
          await tx.pago.delete({ where: { id_pago: p.id_pago } });
        }
      }
    });

    return {
      statusCode: 200,
      message: 'Pedido (y recursos relacionados) eliminado exitosamente.'
    };

  } catch (error: any) {
    console.error('Error en eliminar-reserva.delete:', error);

    if (error?.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Elemento no encontrado al intentar eliminar.' });
    }

    throw createError({ statusCode: 500, statusMessage: error?.message || 'Error interno al procesar la solicitud.' });
  }
});
