// server/api/admin/agregar-producto.post.ts
import { db } from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { 
      nombre, 
      stock, 
      precio, 
      disponible,
      tipo,
      id_proveedor,
      descripcion,
      imagen_url
    } = body;

    if (!nombre || !tipo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre y el tipo de producto son obligatorios.',
      });
    }

    // FIX: Usamos tx.producto y convertimos precio/stock a Decimal/Int
    const nuevoProducto = await db.producto.create({
      data: {
        nombre_producto: nombre,
        stock_actual: Number(stock) || 0,
        precio_unitario: new Prisma.Decimal(Number(precio) || 0), // Convertir a Decimal
        disponible: disponible,
        tipo_producto: tipo,
        id_proveedor: id_proveedor ? Number(id_proveedor) : null,
        descripcion: descripcion, 
        imagen_url: imagen_url,
      },
    });

    return {
      statusCode: 201,
      message: 'Producto creado exitosamente.',
      data: nuevoProducto,
    };

  } catch (error: any) {
    console.error("Error al crear el producto:", error);
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Error: Ya existe un producto con ese nombre.',
      });
    }
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al crear el producto.',
    });
  }
});