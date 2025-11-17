// server/api/productos.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (CORRECCION) Usa PascalCase: db.Producto
    const productos = await db.producto.findMany({
      where: {
        disponible: true,
      },
      orderBy: {
        nombre_producto: 'asc',
      },
    });

    const formattedProductos = productos.map((p) => {
      return {
        id: p.cod_producto,
        nombre: p.nombre_producto || 'Sin Nombre',
        precio: Number(p.precio_unitario) || 0,
        tipo: p.tipo_producto || 'Otro',
      };
    });

    return formattedProductos;

  } catch (error: any) {
    console.error("Error al obtener lista pública de productos:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar los productos.',
    });
  }
});