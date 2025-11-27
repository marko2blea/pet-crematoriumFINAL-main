// server/api/admin/editar-reserva.put.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, readBody, createError } from 'h3';

interface ReservaUpdateBody {
  id_pedido: number;
  id_reserva: number | null;
  es_reserva: boolean;
  estado_reserva: string;
  fecha_reservada: string | null; // YYYY-MM-DD
  hora_reservada: string | null;  // HH:MM
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ReservaUpdateBody>(event);
    const {
      id_pedido,
      id_reserva,
      es_reserva,
      estado_reserva,
      fecha_reservada,
      hora_reservada,
    } = body;

    if (!id_pedido) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de pedido faltante.',
      });
    }

    // ------------- CASO 1: ES RESERVA DE SERVICIO -------------
    if (es_reserva) {
      if (!id_reserva) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID de reserva faltante para actualizar la reserva.',
        });
      }

      let newEstado = estado_reserva;
      let fechaCompleta: Date | null = null;

      if (fecha_reservada && hora_reservada) {
        const dateTimeString = `${fecha_reservada}T${hora_reservada}:00.000Z`;
        fechaCompleta = new Date(dateTimeString);

        if (newEstado === 'Pendiente') {
          newEstado = 'Confirmada';
        }
      } else {
        if (
          newEstado !== 'Cancelada' &&
          newEstado !== 'En Proceso' &&
          newEstado !== 'Finalizada'
        ) {
          newEstado = 'Pendiente';
        }
      }

      const updatedReserva = await db.reserva.update({
        where: { id_reserva },
        data: {
          estado_reserva: newEstado,
          fecha_reservada: fechaCompleta,
          hora_reservada: fechaCompleta,
        },
      });

      return {
        statusCode: 200,
        message: `Reserva #${id_reserva} actualizada a estado: ${newEstado}.`,
        reserva: updatedReserva,
      };
    }

    // ------------- CASO 2: SOLO PRODUCTOS (NO ES RESERVA) -------------
    // Aquí usamos estado_reserva como "estado del pedido/envío"
    const updatedPedido = await db.pedido.update({
      where: { id_pedido },
      data: {
        estado_pedido: estado_reserva,
      },
    });

    // Si hay envío, intentamos actualizar también su estado
    try {
      await db.envio.update({
        where: { id_pedido },
        data: {
          estado_envio: estado_reserva,
        },
      });
    } catch (e) {
      // Si no hay registro de envío, simplemente lo ignoramos
      console.warn(
        `Pedido #${id_pedido} no tiene envío asociado o no se pudo actualizar el envío.`
      );
    }

    return {
      statusCode: 200,
      message: `Pedido #${id_pedido} actualizado a estado: ${estado_reserva}.`,
      pedido: updatedPedido,
    };
  } catch (error: any) {
    console.error('Error al editar reserva/pedido:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Error al guardar los cambios: ${
        error.message || 'Error interno.'
      }`,
    });
  }
});
