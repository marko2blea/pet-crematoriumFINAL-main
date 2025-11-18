// server/api/admin/reserva-detalle-editable.get.ts
import { db } from '../../utils/prisma';

/**
 * API para obtener el detalle de UN pedido/reserva para el formulario de edición.
 * Ruta: /api/admin/reserva-detalle-editable
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as string | undefined;

    if (!id || isNaN(Number(id))) {
      throw createError({ statusCode: 400, statusMessage: 'ID de pedido inválido.' });
    }

    const pedido = await db.pedido.findUniqueOrThrow({
      where: { id_pedido: Number(id) },
      include: {
        usuario: { select: { nombre: true, apellido_paterno: true } },
        detalles_pedido: { select: { producto: { select: { nombre_producto: true } } }, take: 1 },
        pago: { select: { estado: true } },
        reserva: { select: { cod_trazabilidad: true, estado_reserva: true, fecha_reservada: true, hora_reservada: true } }
      }
    });

    if (!pedido.reserva) {
      throw createError({ statusCode: 404, statusMessage: 'Este pedido no es una reserva (no tiene reserva asociada).' });
    }

    return {
      id: pedido.id_pedido,
      cliente: `${pedido.usuario?.nombre || 'Cliente'} ${pedido.usuario?.apellido_paterno || ''}`.trim(),
      servicio: pedido.detalles_pedido[0]?.producto.nombre_producto || 'N/A',
      codTrazabilidad: pedido.reserva.cod_trazabilidad || '',
      estadoPedido: pedido.estado_pedido,
      estadoReserva: pedido.reserva.estado_reserva,
      fechaReservada: pedido.reserva.fecha_reservada ? new Date(pedido.reserva.fecha_reservada).toISOString().slice(0,10) : null,
      horaReservada: pedido.reserva.hora_reservada ? new Date(pedido.reserva.hora_reservada).toISOString().slice(11,19) : null,
    };
  } catch (error: any) {
    console.error("Error al obtener detalle de reserva editable:", error);
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: `Pedido no encontrado.` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el pedido.' });
  }
});
