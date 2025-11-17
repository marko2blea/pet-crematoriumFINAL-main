// server/api/auth/solicitar-reseteo.ts
import { db } from '../../utils/prisma';
import crypto from 'crypto'; 
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  try {
    const { email }: { email: string } = await readBody(event);

    // (MODIFICADO) Usa PascalCase: db.usuario
    const usuario = await db.usuario.findUnique({
      where: { correo: email },
    });

    if (!usuario) {
      console.log(`Solicitud de reseteo para email no existente: ${email}`);
      return { message: 'Si tu correo está registrado, recibirás un enlace.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // (MODIFICADO) Usa PascalCase: db.usuario
    await db.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        reset_token: token,
        reset_token_expires: expires,
      },
    });

    const resetLink = `http://localhost:3000/resetear-contrasena?token=${token}`;

    try {
      await resend.emails.send({
        from: 'Crematorio San Antonio <no-reply@tu-dominio-verificado.com>', 
        to: email,
        subject: 'Reseteo de contraseña - Crematorio San Antonio',
        html: `<p>Hola, ${usuario.nombre || 'usuario'}.</p>
               <p>Haz clic en el siguiente enlace para resetear tu contraseña:</p>
               <a href="${resetLink}">Resetear Contraseña</a>
               <p>El enlace expira en 1 hora.</p>
               <p>Si no solicitaste esto, ignora este correo.</p>`
      });
    } catch (emailError) {
      console.error("Error al enviar email con Resend:", emailError);
      throw createError({ statusCode: 500, statusMessage: 'Error al enviar el correo.' });
    }

    return { message: 'Si tu correo está registrado, recibirás un enlace.' };

  } catch (error: any) {
    console.error("Error al solicitar reseteo:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor.',
    });
  }
});