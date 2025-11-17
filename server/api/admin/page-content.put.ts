import { db } from '../../utils/prisma';
export default defineEventHandler(async (event) => {
  try {
    const { page_key, title, subtitle } = await readBody(event);
    if (!page_key) throw createError({ statusCode: 400, statusMessage: 'Falta "page_key".' });

    const updated = await db.pageContent.update({
      where: { page_key: page_key },
      data: { title, subtitle },
    });
    return { statusCode: 200, message: 'Encabezado actualizado', data: updated };
  } catch (error: any) {
    if (error.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Contenido no encontrado.' });
    throw createError({ statusCode: 500, statusMessage: 'Error al actualizar.' });
  }
});