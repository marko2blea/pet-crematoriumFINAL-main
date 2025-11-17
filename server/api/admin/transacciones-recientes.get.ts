// server/api/admin/transacciones-recientes.get.ts
import { db } from '../../utils/prisma';

/**
 * API para obtener la lista de transacciones pagadas recientes (Pedidos Pagados)
 * para la tabla en la página de Reportes.
 */
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

    // (MODIFICADO) Consulta Pagos que estén 'Pagado' y tengan un Pedido asociado
    const pagos = await db.pago.findMany({
      where: {
        estado: 'Pagado',
        fecha_pago: { gte: startDate, lte: today },
        pedido: { isNot: null } // Asegurarse de que el pago esté vinculado a un pedido
      },
      include: {
        pedido: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido_paterno: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_pago: 'desc',
      },
      take: 50,
    });

    // 3. Formatear la respuesta
    const transacciones = pagos.map(pago => {
      const usuario = pago.pedido?.usuario;
      const nombreCliente = usuario ? `${usuario.nombre} ${usuario.apellido_paterno}` : 'Usuario Eliminado';
      
      return {
        id: pago.id_pago,
        fecha: pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-CL') : 'N/A',
        cliente: nombreCliente.trim(),
        monto: Number(pago.monto) || 0,
        metodo: pago.nombre_metodo || 'N/A',
      };
    });

    return transacciones;

  } catch (error: any) {
    console.error("Error al obtener transacciones recientes:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar transacciones.',
    });
  }
});