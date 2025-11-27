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

    // Validaciones básicas
    if (!nombre || !tipo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre y el tipo de producto son obligatorios.',
      });
    }

    // Normalizar valores
    const nombreLimpio = String(nombre).trim();
    const tipoLimpio = String(tipo).trim();

    if (!nombreLimpio) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre del producto no puede estar vacío.',
      });
    }

    const esServicio = tipoLimpio === 'Servicio';

    const stockFinal = esServicio ? 0 : Number(stock) || 0;

    const dataToCreate = {
      nombre_producto: nombreLimpio,
      stock_actual: stockFinal,
      precio_unitario: new Prisma.Decimal(Number(precio) || 0),
      disponible: typeof disponible === 'boolean' ? disponible : true,
      tipo_producto: tipoLimpio,
      id_proveedor: esServicio
        ? null
        : (id_proveedor ? Number(id_proveedor) : null),
      descripcion: descripcion && String(descripcion).trim() !== ''
        ? String(descripcion).trim()
        : null,
      imagen_url: imagen_url && String(imagen_url).trim() !== ''
        ? String(imagen_url).trim()
        : null,
    };

    const nuevoProducto = await db.producto.create({
      data: dataToCreate,
    });

    return {
      statusCode: 201,
      message: 'Producto creado exitosamente.',
      data: nuevoProducto,
    };
  } catch (error: any) {
    console.error('Error al crear el producto:', error);

    // Conflicto por UNIQUE (ej: nombre_producto duplicado)
    if (error.code === 'P2002') {
      return sendError(
        event,
        createError({
          statusCode: 409,
          statusMessage: 'Error: Ya existe un producto con ese nombre.',
        })
      );
    }

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al crear el producto.',
    });
  }
});
