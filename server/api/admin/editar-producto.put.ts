// server/api/admin/editar-producto.put.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { 
      id, // Este es el cod_producto
      nombre, 
      stock, 
      precio, 
      disponible,
      tipo,
      id_proveedor,
      descripcion, // (NUEVO)
      imagen_url   // (NUEVO)
    } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto no proporcionado.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.producto
    const productoActualizado = await db.producto.update({
      where: { cod_producto: Number(id) },
      data: {
        nombre_producto: nombre,
        stock_actual: Number(stock),
        precio_unitario: Number(precio),
        disponible: disponible,
        tipo_producto: tipo,
        id_proveedor: id_proveedor ? Number(id_proveedor) : null,
        descripcion: descripcion, // (NUEVO)
        imagen_url: imagen_url,   // (NUEVO)
      },
    });

    return {
      statusCode: 200,
      message: 'Producto actualizado exitosamente.',
      data: productoActualizado,
    };

  } catch (error: any) {
    console.error("Error al actualizar el producto:", error);
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Error: Ya existe un producto con ese nombre.',
      });
    }
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al actualizar el producto.',
    });
  }
});