// server/api/usuario/editar-perfil.put.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const { 
      id_usuario, 
      nombre, 
      apellido_paterno, 
      apellido_materno,
      telefono,
      region,
      comuna,
      direccion
    } = await readBody(event);

    if (!id_usuario) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de usuario no proporcionado.',
      });
    }

    const usuarioActualizado = await db.usuario.update({
      where: {
        id_usuario: Number(id_usuario),
      },
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        region,
        comuna,
        direccion
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        correo: true,
        telefono: true,
        region: true,
        comuna: true,
        direccion: true,
        id_rol: true,
        // (CORRECCIÓN) Se reemplaza 'id_mascota' por la relación 'mascotas'
        mascotas: {
          select: {
            id_mascota: true,
            nombre_mascota: true
          }
        }
      }
    });

    return { 
      statusCode: 200, 
      message: 'Perfil actualizado exitosamente.',
      user: usuarioActualizado // Ahora devuelve 'mascotas: []'
    };

  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    if (error.code === 'P2025') {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Usuario no encontrado.' 
      });
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al actualizar el perfil.' 
    });
  }
});