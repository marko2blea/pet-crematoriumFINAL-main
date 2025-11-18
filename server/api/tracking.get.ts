// server/api/tracking.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event);
    const codigo = q.codigo as string | undefined;
    const id = q.id ? Number(q.id as string) : undefined;

    if (!codigo && !id) {
      throw createError({ statusCode: 400, statusMessage: 'Proporciona codigo o id' });
    }

    const where = codigo ? { cod_trazabilidad: codigo } : { id_reserva: id! };

    const reserva = await db.reserva.findFirst({
      where,
      include: {
        pedido: {
          include: {
            pago: true,
            usuario: true,
          }
        },
        detalle_reserva: true,
      }
    });

    if (!reserva) {
      throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada' });
    }

    // Resolver estado final para UI
    const pago = reserva.pedido?.pago ?? null;
    // Prioridad: pago Cancelado -> Cancelado
    let estado: string = reserva.estado_reserva ?? 'Pendiente';

    if (pago?.estado === 'Cancelado' || pago?.estado === 'Fallido') {
      estado = 'Cancelado';
    } else if (reserva.estado_reserva === 'Finalizado') {
      estado = 'Finalizado';
    } else if (reserva.fecha_reservada && reserva.hora_reservada) {
      // Si hay fecha/hora y no está finalizada ni cancelada, consideramos "En Proceso"
      estado = 'En Proceso';
    } else if (pago?.estado === 'Pendiente') {
      estado = 'Pendiente';
    }

    // Mascota/servicio: preferimos detalle_reserva.nombre_servicio
    const mascota = reserva.detalle_reserva?.nombre_servicio ?? reserva.pedido?.usuario?.nombre ?? 'N/A';

    // Fecha amigable
    let fechaMostrar = 'No asignada';
    if (reserva.fecha_reservada && reserva.hora_reservada) {
      const fecha = new Date(reserva.fecha_reservada).toLocaleDateString('es-CL');
      const hora = new Date(reserva.hora_reservada).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      fechaMostrar = `${fecha} a las ${hora}`;
    } else if (reserva.fecha_reservada) {
      fechaMostrar = new Date(reserva.fecha_reservada).toLocaleDateString('es-CL');
    }

    return {
      codigo: reserva.cod_trazabilidad ?? null,
      mascota,
      fecha: fechaMostrar,
      estado,
      precio_total: reserva.precio_total?.toString?.() ?? null,
      pago: pago ? { id_pago: pago.id_pago, estado: pago.estado, monto: pago.monto?.toString?.() } : null,
      servicio: reserva.detalle_reserva?.nombre_servicio ?? null,
    };

  } catch (error: any) {
    console.error('Error en tracking.get:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno en tracking.' });
  }
});
