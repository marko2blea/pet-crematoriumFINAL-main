// server/api/auth/login.post.ts
import { db } from '../../utils/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { correo, contraseña } = body;

    if (!correo || !contraseña) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Correo y contraseña son obligatorios.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
    const user = await db.usuario.findUnique({
      where: { correo: correo },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Credenciales inválidas (usuario no encontrado).',
      });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contrase_a || '');

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Credenciales inválidas (contraseña incorrecta).',
      });
    }

    const { contrase_a, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      message: 'Inicio de sesión exitoso.',
      user: userWithoutPassword
    };

  } catch (error: any) {
    console.error("Error en API login:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor.',
    });
  }
});