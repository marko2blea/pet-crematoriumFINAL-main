// server/api/admin/about-content.post.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // (MODIFICADO) Usa PascalCase: db.aboutBlock
    const nuevoBloque = await db.aboutBlock.create({
      data: {
        title: body.title || 'Nuevo Bloque',
        body: body.body || 'Contenido...',
        items: body.items || [],
        imagen_url: body.imagen_url || null,
      },
    });

    return { statusCode: 201, data: nuevoBloque };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear el bloque.',
    });
  }
});