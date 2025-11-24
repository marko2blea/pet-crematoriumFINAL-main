// server/api/admin/reservas.get.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, getQuery, createError } from 'h3';
import { Prisma } from '@prisma/client'; // Importar Prisma para tipos de where

// Constantes de paginación
const ITEMS_PER_PAGE = 15;

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const status = query.status as string | undefined;
        // La página debe ser un número, si no, se usa la página 1.
        const page = parseInt(query.page as string || '1'); 
        const skip = (page - 1) * ITEMS_PER_PAGE;

        // 1. Definir el filtro WHERE: Siempre es reserva (es_reserva: true)
        const where: Prisma.PedidoWhereInput = { 
            es_reserva: true 
        }; 

        if (status && status !== 'Todos') {
            // Añadir filtro de estado de pedido si no es 'Todos'
            where.estado_pedido = status; 
        }
        
        // 2. Ejecutar la transacción para obtener el conteo total y los pedidos paginados
        const [pedidos, totalCount] = await db.$transaction([
            db.pedido.findMany({
                where: where,
                skip: skip,
                take: ITEMS_PER_PAGE,
                orderBy: {
                    fecha_pedido: 'desc', // Ordenar por la más reciente
                },
                // 🔥 INCLUDES CRUCIALES para traer toda la información
                include: {
                    usuario: true, // Datos del cliente
                    reserva: {
                        include: {
                            // Detalle_Reserva, si es que la relación ReservaToDetalle está activa
                            detalle_reserva: true, 
                        }
                    }, 
                    pago: true, // Monto del pedido/reserva
                    envio: true, // Datos de envío (si aplica)
                    detalles_pedido: { // Detalles de los productos/servicios comprados
                        include: {
                            producto: true, // Información del producto/servicio
                        }
                    }
                }
            }),
            db.pedido.count({ where: where }),
        ]);

        // 3. Mapear y formatear la data para el frontend
        const formattedReservas = pedidos.map((p) => {
            const servicio = p.detalles_pedido.find(d => d.producto.tipo_producto === 'Servicio');
            
            return {
                id_pedido: p.id_pedido,
                id_usuario: p.id_usuario,
                fecha: p.fecha_pedido,
                // Datos del cliente
                cliente: p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido_paterno}` : 'N/A',
                correo: p.usuario?.correo || 'N/A',
                // Datos de la reserva (principalmente trazabilidad y estado)
                cod_trazabilidad: p.reserva?.cod_trazabilidad || 'N/A',
                fecha_reservada: p.reserva?.fecha_reservada || null,
                estadoReserva: p.reserva?.estado_reserva || 'N/A',
                // Datos del servicio (asumo que solo hay un servicio por reserva)
                nombreServicio: servicio?.producto.nombre_producto || p.reserva?.detalle_reserva?.nombre_servicio || 'N/A',
                // Datos financieros
                monto: Number(p.pago?.monto) || Number(p.precio_total) || 0,
                estadoPedido: p.estado_pedido, // 'Pendiente', 'Pagado', etc.
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