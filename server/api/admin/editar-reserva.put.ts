import { db } from '../../utils/prisma';
import { createError } from 'h3';

// Interfaz para el cuerpo de la solicitud PUT (debe coincidir con reservaForm.value)
interface ReservaUpdateBody {
    id_reserva: number;
    estado_reserva: string;
    fecha_reservada: string | null; // YYYY-MM-DD
    hora_reservada: string | null; // HH:MM
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<ReservaUpdateBody>(event);
        const { id_reserva, estado_reserva, fecha_reservada, hora_reservada } = body;

        if (!id_reserva) {
            throw createError({ statusCode: 400, statusMessage: 'ID de reserva faltante.' });
        }

        // 1. Lógica de Estado Condicional: 
        // Si hay fecha y hora válidas, el estado DEBE ser Confirmada (o En Proceso/Finalizada si el admin lo eligió)
        // Si no hay fecha, el estado DEBE ser Pendiente (a menos que se quiera Cancelar).
        
        let newEstado = estado_reserva;
        let fechaCompleta: Date | null = null;
        
        if (fecha_reservada && hora_reservada) {
            // Combinar fecha (YYYY-MM-DD) y hora (HH:MM) para crear un objeto Date
            const dateTimeString = `${fecha_reservada}T${hora_reservada}:00.000Z`;
            fechaCompleta = new Date(dateTimeString);

            // Si se asignó fecha, asegurar que el estado no sea 'Pendiente'
            if (newEstado === 'Pendiente') {
                 newEstado = 'Confirmada';
            }
        } else {
            // Si el admin borra la fecha, forzamos el estado a Pendiente (a menos que haya sido Cancelada previamente)
            if (newEstado !== 'Cancelada' && newEstado !== 'En Proceso' && newEstado !== 'Finalizada') {
                newEstado = 'Pendiente';
            }
        }

        const updatedReserva = await db.reserva.update({
            where: { id_reserva: id_reserva },
            data: {
                estado_reserva: newEstado,
                // Guardar la fecha completa (fecha y hora en la base de datos)
                fecha_reservada: fechaCompleta, 
                // La columna 'hora_reservada' en la DB no es necesaria si 'fecha_reservada' es DateTime
                // Si 'hora_reservada' existe en tu DB como columna separada, ajusta aquí.
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
            statusMessage: `Error al guardar los cambios: ${error.message || 'Error interno.'}`,
        });
    }
});