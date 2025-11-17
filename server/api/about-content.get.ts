// server/api/about-content.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.aboutBlock
    const bloques = await db.aboutBlock.findMany({
      orderBy: {
        orden: 'asc',
      },
    });
    return bloques;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener el contenido de "Nosotros".',
    });
  }
});