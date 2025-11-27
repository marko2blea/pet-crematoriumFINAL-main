// server/api/admin/editar-producto.put.ts
import { db } from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      cod_producto,
      nombre,
      stock,
      precio,
      disponible,
      tipo,
      id_proveedor,
      descripcion,
      imagen_url,
    } = body;

    if (!cod_producto || isNaN(Number(cod_producto))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto (cod_producto) inválido.',
      });
    }

    if (!nombre || !tipo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre y el tipo de producto son obligatorios.',
      });
    }

    const codProd = Number(cod_producto);
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

    const dataToUpdate = {
      nombre_producto: nombreLimpio,
      stock_actual: stockFinal,
      precio_unitario: new Prisma.Decimal(Number(precio) || 0),
      disponible: typeof disponible === 'boolean' ? disponible : true,
      tipo_producto: tipoLimpio,
      id_proveedor: esServicio
        ? null
        : (id_proveedor ? Number(id_proveedor) : null),
      descripcion:
        descripcion && String(descripcion).trim() !== ''
          ? String(descripcion).trim()
          : null,
      imagen_url:
        imagen_url && String(imagen_url).trim() !== ''
          ? String(imagen_url).trim()
          : null,
    };

    const productoActualizado = await db.producto.update({
      where: { cod_producto: codProd },
      data: dataToUpdate,
    });

    return {
      statusCode: 200,
      message: 'Producto actualizado correctamente.',
      data: productoActualizado,
    };
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);

    if (error.code === 'P2002') {
      // Único en nombre_producto
      throw createError({
        statusCode: 409,
        statusMessage: 'Error: Ya existe un producto con ese nombre.',
      });
    }

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al actualizar el producto.',
    });
  }
});
