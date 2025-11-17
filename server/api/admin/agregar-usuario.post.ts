// server/api/admin/agregar-usuario.post.ts
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
      id_rol,
      telefono,
      region,
      comuna,
      direccion
    } = await readBody(event);

    if (!nombre || !apellido_paterno || !correo || !password || !id_rol) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nombre, Apellido Paterno, Correo, Contraseña y Rol son obligatorios.',
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
        id_rol: Number(id_rol),
        telefono: telefono ? Number(telefono) : null,
        region,
        comuna,
        direccion,
        fecha_registro: new Date(),
      },
    });

    return { 
      statusCode: 201, 
      message: 'Usuario creado exitosamente.'
    };

  } catch (error: any) {
    if (error.statusCode === 409 || error.statusCode === 400) throw error;
    console.error("Error al crear usuario (admin):", error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al crear el usuario.' 
    });
  }
});