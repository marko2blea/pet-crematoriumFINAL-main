// server/api/admin/usuarios.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // (MODIFICADO) Usa PascalCase: db.usuario
    const usuarios = await db.usuario.findMany({
      orderBy: {
        fecha_registro: 'desc',
      },
      include: {
        rol: { 
          select: {
            nombre_rol: true,
          },
        },
      },
    });

    const formattedUsuarios = usuarios.map((u) => {
      return {
        id: u.id_usuario,
        nombre: `${u.nombre || 'Sin'} ${u.apellido_paterno || 'Nombre'}`.trim(),
        email: u.correo || 'N/A',
        rol: u.rol?.nombre_rol || 'N/A',
        fechaRegistro: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-CL') : 'N/A',
      };
    });

    return formattedUsuarios;

  } catch (error: any) {
    console.error("Error al obtener lista de usuarios:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar los usuarios.',
    });
  }
});