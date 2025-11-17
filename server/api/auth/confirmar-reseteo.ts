// server/api/auth/confirmar-reseteo.ts
import { db } from '../../utils/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const { token, password }: { token: string; password: string } = await readBody(event);

    if (!token || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan datos.' });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
    const usuario = await db.usuario.findUnique({
      where: { reset_token: token },
    });

    if (!usuario) {
      throw createError({ statusCode: 404, statusMessage: 'Token no válido.' });
    }

    if (!usuario.reset_token_expires || usuario.reset_token_expires < new Date()) {
      throw createError({ statusCode: 400, statusMessage: 'El token ha expirado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // (MODIFICADO) Usa PascalCase: db.usuario
    await db.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        contrase_a: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Contraseña actualizada con éxito.' };

  } catch (error: any) {
    if (error.statusCode) throw error; 
    console.error("Error al confirmar reseteo:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor.',
    });
  }
});