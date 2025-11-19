// server/api/admin/inventario.get.ts
import { db } from '../../utils/prisma';

/**
 * API para obtener el inventario con paginación.
 * Ruta: /api/admin/inventario
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string || '1');
    const perPage = parseInt(query.perPage as string || '5');
    const skip = (page - 1) * perPage;

    // 1. Obtener el total
    const totalCount = await db.producto.count();

    // 2. Obtener los productos paginados
    const productos = await db.producto.findMany({
      skip: skip,
      take: perPage,
      orderBy: {
        nombre_producto: 'asc',
      },
      include: {
        proveedor: { // FIX: proveedor (camelCase)
          select: {
            proveedor: true,
          },
        },
      },
    });

    const formattedProductos = productos.map((p) => {
      return {
        id: p.cod_producto,
        nombre: p.nombre_producto || 'Sin Nombre',
        proveedorNombre: p.proveedor?.proveedor || 'Sin Proveedor',
        stock: p.stock_actual || 0,
        // FIX: Convertir Decimal a Number para el frontend
        precio: Number(p.precio_unitario) || 0,
        disponible: p.disponible || false,
        tipo: p.tipo_producto || 'Otro',
      };
    });

    // 3. Devolver los productos y el conteo total
    return {
      producto: formattedProductos,
      totalCount: totalCount,
    };

  } catch (error: any) {
    console.error("Error al obtener lista de inventario:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar el inventario.',
    });
  }
});