// server/api/valoraciones.post.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  const { id_producto, id_usuario, rating, comentario } = await readBody(event);

  if (!id_producto || !id_usuario || !rating) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan datos (producto, usuario o rating)' });
  }

  try {
    // (MODIFICADO) Usa PascalCase: db.valoracion
    const existing = await db.valoracion.findUnique({
      where: {
        id_producto_id_usuario: {
          id_producto: Number(id_producto),
          id_usuario: Number(id_usuario)
        }
      }
    });

    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Ya has enviado una valoración para este producto.' });
    }

    // (MODIFICADO) Usa PascalCase: db.valoracion
    const nuevaValoracion = await db.valoracion.create({
      data: {
        id_producto: Number(id_producto),
        id_usuario: Number(id_usuario),
        rating: Number(rating),
        comentario: comentario,
      }
    });

    return { statusCode: 201, message: 'Valoración enviada con éxito' };

  } catch (error: any) {
    if (error.statusCode === 409) throw error;
    console.error("Error al enviar valoración:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar la valoración' });
  }
});