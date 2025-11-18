// server/api/tracking.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const codigo = query.codigo as string | undefined;

    if (!codigo) {
      throw createError({ statusCode: 400, statusMessage: 'Falta el código de trazabilidad.' });
    }

    // Buscar la reserva asociada al código de trazabilidad
    const pedido = await db.pedido.findFirst({
      where: {
        reserva: { cod_trazabilidad: codigo },
      },
      include: {
        reserva: true,
        usuario: true,
        detalles_pedido: {
          include: { producto: true }
        },
      },
    });

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Código no encontrado.' });
    }

    // --- Determinar estado legible ---
    let estado: string = 'Pendiente'; // valor por defecto seguro

    if (pedido.reserva) {
      // Caso: reserva de servicio
      switch (pedido.reserva.estado_reserva) {
        case 'Pendiente':
          estado = 'Pendiente';
          break;
        case 'Confirmada':
        case 'En Proceso':
          estado = 'En Proceso';
          break;
        case 'Finalizada':
          estado = 'Finalizado';
          break;
        default:
          estado = pedido.reserva.estado_reserva || 'Pendiente';
      }
    } else {
      // Caso: pedido normal de producto
      switch (pedido.estado_pedido) {
        case 'Pendiente':
          estado = 'Preparando pedido';
          break;
        case 'Pagado':
        case 'En Proceso':
          estado = 'En tránsito';
          break;
        case 'Finalizado':
          estado = 'Llegó a destino';
          break;
        case 'Cancelado':
          estado = 'Cancelado';
          break;
        default:
          estado = pedido.estado_pedido || 'Pendiente';
      }
    }

    // --- Respuesta ---
    return {
      codigo: pedido.reserva?.cod_trazabilidad || 'N/A',
      mascota: pedido.detalles_pedido[0]?.producto?.nombre_producto || 'Producto',
      fecha: pedido.reserva?.fecha_reservada?.toISOString().split('T')[0] || 'N/A',
      estado,
    };

  } catch (error: any) {
    console.error('Error en tracking:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error interno al consultar el tracking.',
    });
  }
});
