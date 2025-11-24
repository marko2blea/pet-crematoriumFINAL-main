// server/api/admin/actividad.get.ts
import { db } from '../../utils/prisma';
import { createError } from 'h3';

const ITEMS_PER_PAGE_ACTIVITY = 5;

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = parseInt(query.page as string || '1');
        
        if (isNaN(page) || page < 1) {
            throw createError({ statusCode: 400, statusMessage: 'Número de página inválido.' });
        }
        
        const skip = (page - 1) * ITEMS_PER_PAGE_ACTIVITY;

        // Consulta de datos y conteo total
        const [pedidos, totalCount] = await db.$transaction([
            db.pedido.findMany({
                orderBy: { fecha_pedido: 'desc' },
                skip: skip,
                take: ITEMS_PER_PAGE_ACTIVITY, 
                select: {
                    id_pedido: true,
                    fecha_pedido: true,
                    estado_pedido: true,
                    es_reserva: true,
                    usuario: { select: { nombre: true, apellido_paterno: true } },
                },
            }),
            db.pedido.count(),
        ]);

        // Formateo de los datos
        const formattedActivity = pedidos.map((p) => {
            const tipo = p.es_reserva ? 'Reserva' : 'Envío';
            const cliente = `${p.usuario?.nombre || ''} ${p.usuario?.apellido_paterno || ''}`.trim() || 'Cliente Desconocido';
            
            return {
                id: p.id_pedido,
                time: p.fecha_pedido,
                description: `Nuevo ${tipo} de ${cliente}`,
                status: p.estado_pedido,
                type: tipo,
            };
        });

        return {
            data: formattedActivity,
            totalCount: totalCount,
        };

    } catch (error: any) {
        console.error("Error al obtener actividad reciente:", error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor al consultar la actividad.',
        });
    }
});