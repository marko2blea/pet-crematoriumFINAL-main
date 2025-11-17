// server/api/usuario/cambiar-contrasena.put.ts
import { db } from '../../utils/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const { 
      id_usuario, 
      currentPassword,
      newPassword
    } = await readBody(event);

    if (!id_usuario || !currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan datos (ID, contraseña actual y contraseña nueva).',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
    const usuario = await db.usuario.findUnique({
      where: { id_usuario: Number(id_usuario) },
    });

    if (!usuario || !usuario.contrase_a) {
      throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, usuario.contrase_a);

    if (!isMatch) {
      throw createError({
        statusCode: 403,
        statusMessage: 'La contraseña actual es incorrecta.',
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // (MODIFICADO) Usa PascalCase: db.usuario
    await db.usuario.update({
      where: { id_usuario: Number(id_usuario) },
      data: {
        contrase_a: hashedNewPassword,
      },
    });

    return { 
      statusCode: 200, 
      message: 'Contraseña actualizada exitosamente.'
    };

  } catch (error: any) {
    if (error.statusCode) throw error; 
    console.error("Error al cambiar contraseña:", error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al cambiar la contraseña.' 
    });
  }
});