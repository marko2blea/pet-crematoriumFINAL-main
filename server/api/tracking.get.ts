import { db } from '../utils/prisma';

/**
 * API PÚBLICA para que los clientes rastreen sus servicios.
 * Ruta: /api/tracking
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const codigo = query.codigo as string | undefined;

    if (!codigo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Debe proporcionar un código de trazabilidad.'
      });
    }

    // ===============================
    // 1. Buscar la reserva por código
    // ===============================
    const reserva = await db.reserva.findFirst({
      where: { cod_trazabilidad: codigo },
      include: {
        // RELACIÓN CORRECTA: Reserva → Pedido → Pago / Usuario
        pedido: {
          include: {
            pago: { select: { estado: true } },
            usuario: {
              select: {
                nombre: true,
                apellido_paterno: true
              }
            }
          }
        },
        // RELACIÓN CORRECTA: Reserva → Detalle_Reserva
        detalle_reserva: {
          select: { nombre_servicio: true }
        }
      }
    });

    if (!reserva) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Código no encontrado. Verifique el código e intente de nuevo.'
      });
    }

    // ===============================
    // 2. Lógica de estado
    // ===============================
    let computedStatus: string;
    let fechaMostrar: string;

    const pago = reserva.pedido?.pago;
    const isCanceled = pago?.estado === 'Cancelado';

    if (isCanceled) {
      computedStatus = 'Cancelado';
      fechaMostrar = 'Reserva Anulada';
    } else if (reserva.fecha_reservada && reserva.hora_reservada) {
      // Pago OK → Fecha & hora asignadas
      computedStatus = reserva.estado_reserva === 'Finalizado'
        ? 'Finalizado'
        : 'Confirmado';

      const fecha = new Date(reserva.fecha_reservada).toLocaleDateString('es-CL');
      const hora = new Date(reserva.hora_reservada).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });

      fechaMostrar = `Fecha de ${
        computedStatus === 'Finalizado' ? 'Entrega' : 'Retiro'
      }: ${fecha} a las ${hora} (CL)`;
    } else if (pago?.estado === 'Pendiente') {
      computedStatus = 'Pendiente de Pago';
      fechaMostrar = 'Esperando confirmación de pago. Su cupo está reservado.';
    } else {
      computedStatus = 'Pendiente de Asignación';
      fechaMostrar = 'Pronto será contactado para asignar fecha y hora.';
    }

    // ===============================
    // 3. Respuesta final
    // ===============================
    return {
      codigo: reserva.cod_trazabilidad,
      mascota: reserva.detalle_reserva?.nombre_servicio || 'N/A',
      fecha: fechaMostrar,
      estado: computedStatus
    };

  } catch (error: any) {
    console.error('Error en API de tracking:', error);
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor.'
    });
  }
});
