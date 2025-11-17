// server/api/admin/instalacion.delete.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const { id_instalacion }: { id_instalacion: number } = await readBody(event);

    if (!id_instalacion || isNaN(Number(id_instalacion))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de sección no válido.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.instalacion
    await db.instalacion.delete({
      where: { id_instalacion: Number(id_instalacion) },
    });

    return { 
      statusCode: 200, 
      message: 'Sección eliminada exitosamente.' 
    };

  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Sección no encontrada.' });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al eliminar.',
    });
  }
});