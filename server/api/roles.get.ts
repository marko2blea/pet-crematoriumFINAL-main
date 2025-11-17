// server/api/roles.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.rol
    const roles = await db.rol.findMany();
    return roles;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar la base de datos.',
    });
  }
});