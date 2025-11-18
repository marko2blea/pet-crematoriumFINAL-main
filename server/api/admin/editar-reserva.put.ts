// server/api/admin/editar-reserva.put.ts
import { db } from '../../utils/prisma';
import type { Prisma } from '@prisma/client';

type ReservaSelected = {
  id_reserva: number;
  cod_trazabilidad: string;
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      id_reserva?: number;
      estado_reserva?: string;
      cod_trazabilidad?: string | null;
      fecha_reservada?: string | null;
      hora_reservada?: string | null;
      region?: string;
      comuna?: string;
      direccion?: string;
      precio_total?: number;
      id_pedido?: number;
    }>(event);

    if (!body) throw createError({ statusCode: 400, statusMessage: 'Faltan datos en el request.' });

    let reserva: ReservaSelected | null = null;

    await db.$transaction(async (tx) => {
      if (body.id_reserva) {
        const updated = await tx.reserva.update({
          where: { id_reserva: body.id_reserva },
          data: {
            estado_reserva: body.estado_reserva || 'Pendiente',
            cod_trazabilidad: body.cod_trazabilidad || generateTrackingCode(),
            fecha_reservada: body.fecha_reservada ? new Date(body.fecha_reservada) : undefined,
            hora_reservada: body.hora_reservada ? new Date(body.hora_reservada) : undefined,
            region: body.region,
            comuna: body.comuna,
            direccion: body.direccion,
            precio_total: body.precio_total ?? 0,
          },
          select: { id_reserva: true, cod_trazabilidad: true },
        });

        reserva = {
          id_reserva: updated.id_reserva,
          cod_trazabilidad: updated.cod_trazabilidad ?? generateTrackingCode(),
        };
      } else {
        if (!body.id_pedido) throw createError({ statusCode: 400, statusMessage: 'id_pedido es obligatorio para crear reserva.' });
        if (body.precio_total === undefined) throw createError({ statusCode: 400, statusMessage: 'precio_total es obligatorio para crear reserva.' });

        const created = await tx.reserva.create({
          data: {
            estado_reserva: body.estado_reserva || 'Pendiente',
            cod_trazabilidad: generateTrackingCode(),
            fecha_reservada: body.fecha_reservada ? new Date(body.fecha_reservada) : undefined,
            hora_reservada: body.hora_reservada ? new Date(body.hora_reservada) : undefined,
            region: body.region,
            comuna: body.comuna,
            direccion: body.direccion,
            precio_total: body.precio_total,
            id_pedido: body.id_pedido,
          },
          select: { id_reserva: true, cod_trazabilidad: true },
        });

        reserva = {
          id_reserva: created.id_reserva,
          cod_trazabilidad: created.cod_trazabilidad ?? generateTrackingCode(),
        };
      }
    });

    // --- Type guard: aseguramos que reserva nunca es null ---
    if (!reserva) throw createError({ statusCode: 500, statusMessage: 'No se pudo crear o actualizar la reserva.' });

    // ✅ Hacemos un cast seguro
    const finalReserva = reserva as ReservaSelected;

    return {
      statusCode: 200,
      message: 'Reserva procesada correctamente',
      cod_trazabilidad: finalReserva.cod_trazabilidad,
      id_reserva: finalReserva.id_reserva,
    };
  } catch (error) {
    console.error('Error en editar-reserva:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al procesar la reserva',
    });
  }
});

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
