import { db } from '../utils/prisma';
export default defineEventHandler(async (event) => {
  try {
    const { key } = getQuery(event);
    if (!key) throw createError({ statusCode: 400, statusMessage: 'Falta "key".' });

    const content = await db.pageContent.findUniqueOrThrow({
      where: { page_key: key as string },
    });
    return content; // Devuelve { page_key, title, subtitle }
  } catch (error: any) {
     if (error.code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Contenido no encontrado.' });
    throw createError({ statusCode: 500, statusMessage: 'Error al obtener contenido.' });
  }
});