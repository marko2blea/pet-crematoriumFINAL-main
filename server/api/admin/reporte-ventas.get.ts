// server/api/admin/reporte-ventas.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const period = query.period as string || 'month';
    const today = new Date();
    let startDate: Date;

    if (period === 'year') startDate = new Date(today.getFullYear(), 0, 1);
    else if (period === 'quarter') {
      const currentQuarterMonth = Math.floor(today.getMonth() / 3) * 3;
      startDate = new Date(today.getFullYear(), currentQuarterMonth, 1);
    } else startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // (MODIFICADO) Consulta Pedidos 'Pagados'
    const pedidosPagados = await db.pedido.findMany({
      where: {
        estado_pedido: 'Pagado',
        fecha_pedido: { gte: startDate, lte: today },
      },
      include: {
        pago: { select: { monto: true, fecha_pago: true } } // Tomamos la fecha real del pago
      },
      orderBy: {
        fecha_pedido: 'asc',
      },
    });

    const formattedPagos = pedidosPagados.map(p => ({
      fecha: p.pago?.fecha_pago ? new Date(p.pago.fecha_pago).toLocaleDateString('es-CL') : 'Sin Fecha',
      monto: Number(p.pago?.monto) || 0,
    }));
    
    const ventasPorDia = formattedPagos.reduce((acc, pago) => {
      acc[pago.fecha] = (acc[pago.fecha] || 0) + pago.monto;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: Object.keys(ventasPorDia),
      data: Object.values(ventasPorDia),
      total: Object.values(ventasPorDia).reduce((sum, monto) => sum + monto, 0),
    };

  } catch (error: any) {
    console.error("Error al obtener reporte de ventas:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor.' });
  }
});