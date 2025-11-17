// server/api/admin/usuario-detalle.get.ts
import { db } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const id = query.id as string | undefined;

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de usuario inválido o no proporcionado.',
      });
    }

    // (MODIFICADO) Usa PascalCase: Usuario y Rol
    const [usuario, roles] = await db.$transaction([
      db.usuario.findUniqueOrThrow({
        where: { id_usuario: Number(id) },
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
          },
        },
      }),
      db.rol.findMany({
        select: {
          id_rol: true,
          nombre_rol: true,
        },
      }),
    ]);

    return {
      usuario: usuario,
      rolesDisponibles: roles,
    };

  } catch (error: any) {
    console.error("Error al obtener detalle de usuario:", error);
    if (error.code === 'P2025') {
       throw createError({ statusCode: 404, statusMessage: `Usuario no encontrado.` });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el usuario.' });
  }
});