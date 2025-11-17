// server/api/admin/reservas.get.ts
import { db } from '../../utils/prisma';
import type { Prisma } from '@prisma/client';

/**
 * API para obtener la lista COMPLETA de Pedidos (Reservas y Envios).
 * Ruta: /api/admin/reservas
 * Método: GET
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const status = query.status as string | undefined;

    // 1. Construir el filtro de Prisma (Where clause)
    const where: Prisma.PedidoWhereInput = {};
    
    // Solo mostrar Pedidos que son Reservas (Servicios)
    where.es_reserva = true; 

    if (status && status !== 'Todos') {
       where.estado_pedido = status; // "Pendiente", "Pagado", "Cancelado"
    }
    
    // 2. Ejecutar la consulta
    const pedidos = await db.pedido.findMany({
      where: where,
      orderBy: {
        fecha_pedido: 'desc',
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido_paterno: true,
            // (CORRECCIÓN 1) Cambiado a 'mascotas' (plural) y tomando solo 1
            mascotas: {
              select: { nombre_mascota: true },
              take: 1 
            },
          },
        },
        detalles_pedido: {
          select: {
            producto: { select: { nombre_producto: true } }
          },
          take: 1 // Solo tomar el primer item para el nombre
        },
        pago: { 
          select: { monto: true }
        },
        reserva: { // Incluir la reserva para el código y estado
          select: { cod_trazabilidad: true, estado_reserva: true }
        }
      },
    });

    // 3. Formatear la respuesta
    const formattedReservas = pedidos.map((p) => {
      const servicio = p.detalles_pedido[0]?.producto.nombre_producto || 'N/A';
      
      return {
        id: p.id_pedido,
        clientName: `${p.usuario?.nombre || 'Cliente'} ${p.usuario?.apellido_paterno || ''}`.trim(),
        // (CORRECCIÓN 2) Leer del array 'mascotas'
        petName: p.usuario?.mascotas[0]?.nombre_mascota || 'Mascota',
        serviceName: servicio,
        trackingCode: p.reserva?.cod_trazabilidad || 'N/A',
        status: p.estado_pedido,
        amount: Number(p.pago?.monto) || 0,
        statusReserva: p.reserva?.estado_reserva || 'N/A' 
      };
    });

    return formattedReservas;

  } catch (error: any) {
    console.error("Error al obtener lista de reservas:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al consultar las reservas.',
    });
  }
});