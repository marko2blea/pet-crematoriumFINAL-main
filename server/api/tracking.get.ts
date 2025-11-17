// server/api/tracking.get.ts
import { db } from '../utils/prisma';

/**
 * API PÚBLICA para que los clientes rastreen sus servicios.
 * Ruta: /api/tracking
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const codigo = query.codigo as string | undefined;

    if (!codigo) {
      throw createError({ statusCode: 400, statusMessage: 'Debe proporcionar un código.' });
    }

    // 1. Buscar la Reserva por su código
    const reserva = await db.reserva.findUnique({
      where: { cod_trazabilidad: codigo },
      include: {
        pedido: { 
          include: {
            usuario: { 
              include: {
                // (CORRECCIÓN 1) Cambiado a 'mascotas' (plural) y tomando solo 1
                mascotas: { 
                  select: { nombre_mascota: true },
                  take: 1
                }
              }
            }
          }
        }
      },
    });

    if (!reserva || !reserva.pedido || !reserva.pedido.usuario) {
      throw createError({ statusCode: 404, statusMessage: 'Código no encontrado o pedido corrupto.' });
    }

    // 2. Devolver la respuesta
    return {
      codigo: reserva.cod_trazabilidad,
      // (CORRECCIÓN 2) Leer del array 'mascotas'
      mascota: reserva.pedido.usuario.mascotas[0]?.nombre_mascota || 'Mascota',
      fecha: reserva.pedido.fecha_pedido.toLocaleDateString('es-CL'),
      estado: reserva.estado_reserva, 
    };

  } catch (error: any) {
    console.error("Error en API de tracking:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor.' });
  }
});