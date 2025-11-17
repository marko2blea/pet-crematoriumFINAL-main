// server/api/admin/editar-usuario.put.ts
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
      direccion,
      id_rol
    } = await readBody(event);

    if (!id_usuario) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de usuario no proporcionado.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
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
        direccion,
        id_rol: Number(id_rol)
      },
    });

    return { 
      statusCode: 200, 
      message: 'Usuario actualizado exitosamente.',
      user: usuarioActualizado
    };

  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === 'P2025') {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Usuario no encontrado.' 
      });
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al actualizar el usuario.' 
    });
  }
});