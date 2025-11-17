// server/api/admin/dashboard-stats.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // 1. Contar servicios en proceso
    const reservasEnProceso = await db.reserva.count({
      where: {
        estado_reserva: { in: ['Confirmada', 'En Proceso'] }
      },
    });

    // 2. Sumar pagos pendientes (de Pedidos)
    const pedidosPendientes = await db.pedido.aggregate({
      _sum: {
        precio_total: true,
      },
      where: {
        estado_pedido: 'Pendiente',
      },
    });
    const pagosPendientes = pedidosPendientes._sum.precio_total || 0;

    // 3. Contar productos (Urnas) con bajo stock
    const lowStockItems = await db.producto.count({
      where: {
        tipo_producto: 'Urna',
        stock_actual: { lt: 5 },
      },
    });

    return {
      pendingServices: reservasEnProceso,
      pendingPayments: Number(pagosPendientes),
      lowStockItems,
    };

  } catch (error: any) {
    console.error("Error al calcular estadísticas del dashboard:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error al calcular estadísticas.' });
  }
});