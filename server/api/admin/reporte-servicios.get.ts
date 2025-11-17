// server/api/admin/reporte-servicios.get.ts
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

    // (MODIFICADO) Consultar Detalles de Pedidos Pagados
    const detalles = await db.detallePedido.findMany({
      where: {
        pedido: { // Filtrar por el pedido padre
          estado_pedido: 'Pagado',
          fecha_pedido: { gte: startDate, lte: today },
        },
        producto: { // Filtrar por el tipo de producto
          tipo_producto: 'Servicio'
        }
      },
      include: {
        producto: { select: { nombre_producto: true } }
      }
    });

    // 3. Agregar los datos
    const stats = new Map<string, number>();
    for (const detalle of detalles) {
      const nombre = detalle.producto.nombre_producto || 'Servicio Desconocido';
      const cantidad = detalle.cantidad || 0;
      stats.set(nombre, (stats.get(nombre) || 0) + cantidad);
    }

    const formattedData = Array.from(stats.entries())
      .map(([nombre, ventas]) => ({ nombre, ventas }))
      .sort((a, b) => b.ventas - a.ventas); 

    return formattedData;

  } catch (error: any) {
    console.error("Error al obtener reporte de servicios:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor.' });
  }
});