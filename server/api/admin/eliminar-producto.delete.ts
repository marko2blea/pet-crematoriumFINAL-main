// server/api/admin/eliminar-producto.delete.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body;

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de producto no válido o no proporcionado.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.producto
    await db.producto.delete({
      where: { cod_producto: Number(id) },
    });

    return { 
      statusCode: 200, 
      message: 'Producto eliminado exitosamente.' 
    };

  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    
    // (MODIFICADO) P2003 ahora significa que está en un 'DetallePedido'
    if (error.code === 'P2003') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Error: Este producto no se puede eliminar porque está asociado a uno o más pedidos existentes.'
      });
    }
    if (error.code === 'P2025') {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Producto no encontrado.' 
      });
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al eliminar el producto.' 
    });
  }
});