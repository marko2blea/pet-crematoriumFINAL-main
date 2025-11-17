// server/api/admin/agregar-memorial.post.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { nombre, raza, fecha, dedicatoria } = body;

    if (!nombre || !fecha) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre y la fecha son obligatorios.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.memorial
    const nuevoMemorial = await db.memorial.create({
      data: {
        nombre: nombre,
        raza: raza,
        fecha: new Date(fecha),
        dedicatoria: dedicatoria,
      },
    });

    return {
      statusCode: 201,
      message: 'Memorial creado exitosamente.',
      data: nuevoMemorial,
    };
  } catch (error: any) {
    console.error("Error al crear el memorial:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al crear el memorial.',
    });
  }
});