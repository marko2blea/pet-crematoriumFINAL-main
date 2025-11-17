// server/api/memoriales.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.memorial
    const memoriales = await db.memorial.findMany({
      orderBy: {
        fecha: 'desc',
      },
    });
    return memoriales;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener los memoriales.',
    });
  }
});