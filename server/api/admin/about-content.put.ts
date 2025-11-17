// server/api/admin/about-content.put.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id_block, title, body: bodyContent, items, imagen_url } = body;

    if (!id_block) {
      throw createError({ statusCode: 400, statusMessage: 'Falta el ID del bloque.' });
    }

    // (MODIFICADO) Usa PascalCase: db.aboutBlock
    const bloqueActualizado = await db.aboutBlock.update({
      where: { id_block: Number(id_block) },
      data: {
        title: title,
        body: bodyContent,
        items: items,
        imagen_url: imagen_url,
      },
    });

    return { statusCode: 200, data: bloqueActualizado };
  } catch (error: any) {
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: 'Bloque no encontrado.' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al actualizar.' });
  }
});