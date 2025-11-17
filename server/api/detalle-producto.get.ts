// server/api/detalle-producto.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id as string | undefined;

  try {
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto inválido o no proporcionado.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.producto
    const producto = await db.producto.findUniqueOrThrow({
      where: {
        cod_producto: Number(id),
        disponible: true,
      },
      include: {
        proveedor: {
          select: {
            proveedor: true
          }
        }
      }
    });

    const formattedProducto = {
      id: producto.cod_producto,
      nombre: producto.nombre_producto || 'Sin Nombre',
      precio: Number(producto.precio_unitario) || 0,
      tipo: producto.tipo_producto || 'Otro',
      descripcion: producto.descripcion || 'Este producto no tiene una descripción disponible.',
      stock: producto.stock_actual || 0,
      disponible: producto.disponible || false,
      proveedor: producto.proveedor?.proveedor || 'San Antonio',
      imagen_url: producto.imagen_url || null
    };

    return formattedProducto;

  } catch (error: any) {
    console.error("Error al obtener detalle de producto público:", error);
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: `Producto no disponible o no encontrado (ID: ${id}).` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el producto.' });
  }
});