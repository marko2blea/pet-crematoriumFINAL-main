// server/api/admin/reservas.get.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, getQuery, createError } from 'h3';
import { Prisma } from '@prisma/client'; 

// Constantes de paginación
const ITEMS_PER_PAGE = 15;

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const status = query.status as string | undefined;
        const page = parseInt(query.page as string || '1'); 
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const where: Prisma.PedidoWhereInput = {}; 

        if (status && status !== 'Todos') {
            where.estado_pedido = status; 
        }
        
        const [pedidos, totalCount] = await db.$transaction([
            db.pedido.findMany({
                where: where,
                skip: skip,
                take: ITEMS_PER_PAGE,
                orderBy: {
                    fecha_pedido: 'desc',
                },
                include: {
                    // Incluimos las mascotas del usuario para la visualización (temporalmente)
                    usuario: {
                        include: {
                            mascotas: true
                        }
                    }, 
                    reserva: {
                        include: {
                            detalle_reserva: true,
                        }
                    }, 
                    pago: true, 
                    envio: true, 
                    detalles_pedido: { 
                        include: {
                            producto: true, 
                        }
                    }
                }
            }),
            db.pedido.count({ where: where }),
        ]);

        // 3. Mapear y formatear la data para el frontend
        const formattedReservas = pedidos.map((p) => {
            const servicio = p.detalles_pedido.find(d => d.producto.tipo_producto === 'Servicio');
            
            let petName: string = 'N/A';

            if (!p.es_reserva) {
                // Si el pedido NO es una reserva (solo producto)
                 petName = 'No Aplica';
            } else if (p.usuario?.mascotas && p.usuario.mascotas.length > 0) {
                // 🛑 LÓGICA CORREGIDA: Se usa la primera mascota del usuario si existe una reserva
                // Si hay una mascota única para la reserva, la lógica debería ser más específica aquí.
                // Por ahora, para evitar el error de mascota cruzada, usaremos la primera. 
                // La solución definitiva es migrar el Schema con id_mascota en Reserva.
                petName = p.usuario.mascotas[0].nombre_mascota || 'N/A';
            }


            return {
                id_pedido: p.id_pedido,
                id_usuario: p.id_usuario,
                fecha: p.fecha_pedido,
                cliente: p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido_paterno}` : 'N/A',
                correo: p.usuario?.correo || 'N/A',
                petName: petName, 
                cod_trazabilidad: p.reserva?.cod_trazabilidad || 'N/A',
                fecha_reservada: p.reserva?.fecha_reservada || null,
                estadoReserva: p.reserva?.estado_reserva || 'N/A',
                nombreServicio: servicio?.producto.nombre_producto || p.reserva?.detalle_reserva?.nombre_servicio || 'N/A',
                monto: Number(p.pago?.monto) || Number(p.precio_total) || 0,
                estadoPedido: p.estado_pedido, 
            };
        });

        return {
            pedidos: formattedReservas,
            total: totalCount,
            perPage: ITEMS_PER_PAGE,
            currentPage: page,
            totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        };

    } catch (error: any) {
        console.error('Error al obtener reservas:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al consultar las reservas.'
        });
    }
});