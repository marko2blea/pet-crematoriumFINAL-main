// RUTA CORREGIDA: Sube un nivel (desde /api/ a /server/)
import { db } from '../utils/prisma';

/**
 * API PÚBLICA para obtener el detalle de UN producto por su ID.
 * Ruta: /api/producto
 * Método: GET
 * Query Params: ?id= (El ID del producto)
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as string | undefined;

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto inválido o no proporcionado.',
      });
    }

    // 1. Buscar el producto único
    const producto = await db.producto.findUniqueOrThrow({
      where: {
        cod_producto: Number(id),
        disponible: true, // ¡Solo productos disponibles!
      },
    });

    // 2. Formatear la respuesta (igual que la API de lista)
    const formattedProducto = {
      id: producto.cod_producto,
      nombre: producto.nombre_producto || 'Sin Nombre',
      precio: Number(producto.precio_unitario) || 0,
      tipo: producto.tipo_producto || 'Otro',
    };

    return formattedProducto;

  } catch (error: any) {
    console.error("Error al obtener detalle de producto público:", error);
    if (error.code === 'P2025') { // "Registro no encontrado"
       throw createError({ statusCode: 404, statusMessage: `Producto no disponible o no encontrado.` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el producto.' });
  }
});