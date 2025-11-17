// server/api/auth/registro.post.ts
import { db } from '../../utils/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const { 
      nombre, 
      apellido_paterno, 
      apellido_materno, 
      correo, 
      password,
      telefono,
      region,
      comuna,
      direccion
    } = await readBody(event);

    if (!nombre || !apellido_paterno || !correo || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nombre, Apellido Paterno, Correo y Contraseña son obligatorios.',
      });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
    const existingUser = await db.usuario.findUnique({
      where: { correo },
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'El correo electrónico ya está registrado.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // (MODIFICADO) Usa PascalCase: db.usuario
    const newUser = await db.usuario.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        contrase_a: hashedPassword,
        telefono: telefono ? Number(telefono) : null,
        region,
        comuna,
        direccion,
        id_rol: 1, // 1 = Cliente por defecto
        fecha_registro: new Date(),
        // id_mascota se setea al crear la primera reserva
      },
    });

    return { 
      statusCode: 201, 
      message: 'Usuario registrado exitosamente.'
    };

  } catch (error: any) {
    if (error.statusCode === 409 || error.statusCode === 400) throw error;
    console.error("Error al registrar usuario:", error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al registrar el usuario.' 
    });
  }
});