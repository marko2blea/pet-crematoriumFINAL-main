// server/api/admin/producto-detalle.get.ts
import { db } from '../../utils/prisma';

/**
 * API de ADMIN para obtener el detalle de UN producto por su ID (para el formulario de edición).
 */
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
      },
    });

    // 2. Formatear la respuesta para el formulario 'editar-producto.vue'
    const formattedProducto = {
      id: producto.cod_producto,
      nombre: producto.nombre_producto || 'Sin Nombre',
      stock: producto.stock_actual || 0,
      precio: Number(producto.precio_unitario) || 0,
      disponible: producto.disponible || false,
      tipo: producto.tipo_producto || 'Otro',
      id_proveedor: producto.id_proveedor || null,
      descripcion: producto.descripcion || '', // (NUEVO)
      imagen_url: producto.imagen_url || '', // (NUEVO)
    };

    return formattedProducto;

  } catch (error: any) {
    console.error("Error al obtener detalle de producto (admin):", error);
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: `Producto con ID ${id} no encontrado.` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el producto.' });
  }
});