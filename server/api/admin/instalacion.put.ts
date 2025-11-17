// server/api/admin/instalacion.put.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); 
    const { id_instalacion, title, body: bodyContent, features, imagen_url } = body;

    if (!id_instalacion) {
      throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la sección.' });
    }

    // (MODIFICADO) Usa PascalCase: db.instalacion
    const seccionActualizada = await db.instalacion.update({
      where: { id_instalacion: Number(id_instalacion) },
      data: {
        title: title,
        body: bodyContent,
        features: features,
        imagen_url: imagen_url,
      },
    });

    return {
      statusCode: 200,
      message: 'Sección actualizada exitosamente.',
      data: seccionActualizada,
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: 'Sección no encontrada.' });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al actualizar.',
    });
  }
});