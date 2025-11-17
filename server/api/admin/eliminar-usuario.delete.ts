// server/api/admin/eliminar-usuario.delete.ts
import { db } from '../../utils/prisma';
import type { User } from '../../../app/types';

export default defineEventHandler(async (event) => {
  try {
    // 1. Obtener el ID del admin que está haciendo la solicitud (si tienes auth)
    // const adminUser = event.context.user as User;
    // if (!adminUser) {
    //   throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
    // }

    const { id: userIdToDelete }: { id: number } = await readBody(event);

    if (!userIdToDelete || isNaN(Number(userIdToDelete))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de usuario no válido o no proporcionado.',
      });
    }
    
    // (Opcional) MEDIDA DE SEGURIDAD: Evitar que un admin se elimine a sí mismo
    // if (adminUser.id_usuario === userIdToDelete) {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: 'No puede eliminar su propia cuenta de administrador.',
    //   });
    // }

    // (MODIFICADO) La tabla 'usuario_permisos' ya no existe.
    // Ahora debemos verificar si el usuario tiene Pedidos antes de borrar.
    
    // (MODIFICADO) Usa PascalCase: db.pedido
    const pedidos = await db.pedido.count({
      where: { id_usuario: userIdToDelete }
    });

    if (pedidos > 0) {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: 'Error: Este usuario no se puede eliminar porque tiene pedidos asociados.'
      });
    }

    // (MODIFICADO) Usa PascalCase: db.usuario
    await db.usuario.delete({
      where: { id_usuario: userIdToDelete },
    });

    return { 
      statusCode: 200, 
      message: 'Usuario eliminado exitosamente.' 
    };

  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    
    if (error.statusCode === 409) {
      throw error;
    }
    
    if (error.code === 'P2003') { // Error de foreign key (si tiene mascotas u otros)
      throw createError({
        statusCode: 409,
        statusMessage: 'Error: Este usuario no se puede eliminar porque tiene mascotas, valoraciones u otros datos asociados.'
      });
    }
    if (error.code === 'P2025') { // No encontrado
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Usuario no encontrado.' 
      });
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno del servidor al eliminar el usuario.' 
    });
  }
});