// server/api/admin/dashboard-activity.get.ts
import { db } from '../../utils/prisma';

/**
 * API para el widget "Actividad Reciente" del Dashboard.
 * Obtiene los 5 Pedidos más recientes que están pendientes de pago.
 */
export default defineEventHandler(async (event) => {
  try {
    const pedidosPendientes = await db.pedido.findMany({
      where: {
        estado_pedido: 'Pendiente',
        es_reserva: true // Solo mostrar reservas en este widget
      },
      orderBy: {
        fecha_pedido: 'desc',
      },
      take: 5,
      include: {
        usuario: {
          select: { nombre: true, apellido_paterno: true },
        },
        detalles_pedido: {
          select: { producto: { select: { nombre_producto: true } } },
          take: 1
        },
        pago: {
            select: { monto: true }
        }
      },
    });

    const formatted = pedidosPendientes.map(pedido => ({
      id_reserva: pedido.id_pedido, // (MODIFICADO) Es el ID del Pedido
      cliente: `${pedido.usuario?.nombre || 'Cliente'} ${pedido.usuario?.apellido_paterno || ''}`.trim(),
      servicio: pedido.detalles_pedido[0]?.producto.nombre_producto || 'N/A',
      monto: Number(pedido.pago?.monto) || 0,
      fecha: new Date(pedido.fecha_pedido).toLocaleDateString('es-CL')
    }));
    
    return formatted;

  } catch (error: any) {
    console.error("Error al obtener actividad del dashboard:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar la actividad.',
    });
  }
});