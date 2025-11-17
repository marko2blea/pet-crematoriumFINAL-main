// server/api/admin/editar-memorial.put.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id_memorial, nombre, raza, fecha, dedicatoria } = body;

    if (!id_memorial) {
      throw createError({ statusCode: 400, statusMessage: 'Falta el ID del memorial.' });
    }

    // (MODIFICADO) Usa PascalCase: db.memorial
    const memorialActualizado = await db.memorial.update({
      where: { id_memorial: Number(id_memorial) },
      data: {
        nombre: nombre,
        raza: raza,
        fecha: new Date(fecha),
        dedicatoria: dedicatoria,
      },
    });

    return {
      statusCode: 200,
      message: 'Memorial actualizado exitosamente.',
      data: memorialActualizado,
    };
  } catch (error: any) {
    console.error("Error al actualizar el memorial:", error);
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: 'Memorial no encontrado.' });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al actualizar.',
    });
  }
});