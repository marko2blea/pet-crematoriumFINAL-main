// server/api/admin/instalacion.post.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // (MODIFICADO) Usa PascalCase: db.instalacion
    const nuevaSeccion = await db.instalacion.create({
      data: {
        title: body.title || 'Nueva Sección',
        body: body.body || 'Descripción de la sección...',
        features: body.features || ['Nueva característica'],
        imagen_url: body.imagen_url || null,
      },
    });

    return {
      statusCode: 201,
      message: 'Sección creada exitosamente.',
      data: nuevaSeccion,
    };
  } catch (error: any) {
    console.error("Error al crear la sección:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al crear la sección.',
    });
  }
});