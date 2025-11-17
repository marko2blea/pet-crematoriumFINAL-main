// server/api/instalaciones.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.instalacion
    const secciones = await db.instalacion.findMany({
      orderBy: {
        orden: 'asc',
      },
    });
    return secciones;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener las secciones de instalaciones.',
    });
  }
});