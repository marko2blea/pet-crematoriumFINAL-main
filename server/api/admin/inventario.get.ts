// server/api/admin/inventario.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.producto
    const productos = await db.producto.findMany({
      orderBy: {
        nombre_producto: 'asc',
      },
      include: {
        proveedor: {
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
        precio: Number(p.precio_unitario) || 0,
        disponible: p.disponible || false,
        tipo: p.tipo_producto || 'Otro',
      };
    });

    return formattedProductos;

  } catch (error: any) {
    console.error("Error al obtener lista de inventario:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar el inventario.',
    });
  }
});