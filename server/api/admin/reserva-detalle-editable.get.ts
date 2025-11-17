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
    // (MODIFICADO) Este ID es ahora id_pedido
    const id = query.id as string | undefined;

    if (!id || isNaN(Number(id))) {
      throw createError({ statusCode: 400, statusMessage: 'ID de pedido inválido.' });
    }

    // 1. Buscar el Pedido
    const pedido = await db.pedido.findUniqueOrThrow({
      where: { id_pedido: Number(id) },
      include: {
        usuario: {
          select: { nombre: true, apellido_paterno: true }
        },
        detalles_pedido: {
          select: { producto: { select: { nombre_producto: true } } },
          take: 1
        },
        pago: {
          select: { estado: true }
        },
        reserva: {
          select: { cod_trazabilidad: true, estado_reserva: true }
        }
      }
    });

    if (!pedido.reserva) {
        throw createError({ statusCode: 404, statusMessage: 'Este pedido no es una reserva, es un envío.' });
    }

    // 2. Formatear la respuesta para el formulario
    return {
      id: pedido.id_pedido,
      cliente: `${pedido.usuario?.nombre || 'Cliente'} ${pedido.usuario?.apellido_paterno || ''}`.trim(),
      servicio: pedido.detalles_pedido[0]?.producto.nombre_producto || 'N/A',
      codTrazabilidad: pedido.reserva.cod_trazabilidad || '',
      
      // (MODIFICADO) Estados para los <select>
      estadoPedido: pedido.estado_pedido, // "Pendiente", "Pagado", "Cancelado"
      estadoReserva: pedido.reserva.estado_reserva // "Pendiente", "Confirmada", "En Proceso", "Finalizada"
    };

  } catch (error: any) {
    console.error("Error al obtener detalle de reserva editable:", error);
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: `Pedido no encontrado.` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el pedido.' });
  }
});