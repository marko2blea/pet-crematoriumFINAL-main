// server/api/valoraciones.get.ts
import { db } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: 'ID de producto inválido' });
  }

  try {
    // (MODIFICADO) Usa PascalCase: db.valoracion
    const valoraciones = await db.valoracion.findMany({
      where: { id_producto: Number(id) },
      orderBy: { fecha_creacion: 'desc' },
      include: {
        usuario: { // (MODIFICADO) Usa PascalCase: usuario
          select: { nombre: true, apellido_paterno: true }
        }
      }
    });
    
    return valoraciones.map(v => ({
      id_valoracion: v.id_valoracion,
      rating: v.rating,
      comentario: v.comentario,
      fecha: v.fecha_creacion.toLocaleDateString('es-CL'),
      autor: `${v.usuario.nombre || 'Usuario'} ${v.usuario.apellido_paterno || ''}`.trim()
    }));

  } catch (error) {
    console.error("Error al obtener valoraciones:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error al cargar valoraciones' });
  }
});