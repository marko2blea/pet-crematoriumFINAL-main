// server/api/admin/editar-reserva.put.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, readBody, createError } from 'h3';

interface ReservaUpdateBody {
  id_reserva: number;
  estado_reserva: string;
  fecha_reservada: string | null; // YYYY-MM-DD
  hora_reservada: string | null;  // HH:MM
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ReservaUpdateBody>(event);
    const { id_reserva, estado_reserva, fecha_reservada, hora_reservada } = body;

    if (!id_reserva) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de reserva faltante.',
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
        hora_reservada: fechaCompleta, // 🔥 usamos la misma Date para fecha y hora
      },
    });

    return {
      statusCode: 200,
      message: `Reserva #${id_reserva} actualizada a estado: ${newEstado}.`,
      reserva: updatedReserva,
    };
  } catch (error: any) {
    console.error('Error al editar reserva:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Error al guardar los cambios: ${
        error.message || 'Error interno.'
      }`,
    });
  }
});
