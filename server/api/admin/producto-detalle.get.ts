// server/api/admin/producto-detalle.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const idParam = query.id as string | undefined;

    if (!idParam || isNaN(Number(idParam))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto inválido o no proporcionado.',
      });
    }

    const cod_producto = Number(idParam);

    const producto = await db.producto.findUnique({
      where: { cod_producto },
      select: {
        cod_producto: true,
        nombre_producto: true,
        stock_actual: true,
        precio_unitario: true,
        disponible: true,
        tipo_producto: true,
        id_proveedor: true,
        descripcion: true,
        imagen_url: true,
      },
    });

    if (!producto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontró el producto solicitado.',
      });
    }

    return producto;
  } catch (error: any) {
    console.error('Error al obtener detalle de producto:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al obtener el producto.',
    });
  }
});
