// server/api/admin/proveedores.get.ts
import { db } from '../../utils/prisma';

/**
 * API para listar todos los proveedores (para dropdowns)
 * Ruta: /api/admin/proveedores
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.proveedor
    const proveedores = await db.proveedor.findMany({
      where: { disponible: true },
      select: {
        id_proveedor: true,
        proveedor: true,
      },
      orderBy: {
        proveedor: 'asc',
      },
    });
    return proveedores;
  } catch (error: any) {
    console.error("Error al obtener proveedores:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor.',
    });
  }
});