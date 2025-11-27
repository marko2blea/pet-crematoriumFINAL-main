// server/api/admin/dashboard-activity.get.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Traer SIEMPRE los últimos 5 pedidos (de cualquier tipo)
    const pedidos = await db.pedido.findMany({
      orderBy: { fecha_pedido: 'desc' },
      take: 5,
      include: {
        usuario: true,
        reserva: {
          include: {
            detalle_reserva: true,
          },
        },
        pago: true,
        detalles_pedido: {
          include: {
            producto: true,
          },
        },
      },
    });

    const actividad = pedidos.map((p) => {
      // Cliente
      const cliente =
        p.usuario?.nombre && p.usuario?.apellido_paterno
          ? `${p.usuario.nombre} ${p.usuario.apellido_paterno}`
          : p.usuario?.nombre || 'Cliente desconocido';

      // Determinar "servicio"/descripción principal
      const servicioDetalle = p.reserva?.detalle_reserva;
      const servicioProducto = p.detalles_pedido.find(
        (d) => d.producto && d.producto.tipo_producto === 'Servicio'
      );

      let servicioNombre = 'Solo productos';
      if (servicioDetalle?.nombre_servicio) {
        servicioNombre = servicioDetalle.nombre_servicio;
      } else if (servicioProducto?.producto?.nombre_producto) {
        servicioNombre = servicioProducto.producto.nombre_producto;
      }

      // Monto (pago si existe, sino precio_total del pedido)
      const monto = Number(p.pago?.monto) || Number(p.precio_total) || 0;

      // Fecha legible
      const fechaObj = p.fecha_pedido;
      const fecha = fechaObj
        ? fechaObj.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';

      return {
        id_reserva: p.reserva?.id_reserva ?? p.id_pedido, // fallback al id_pedido si no hubiera reserva
        cliente,
        servicio: servicioNombre,
        monto,
        fecha,
      };
    });

    return actividad;
  } catch (error: any) {
    console.error('Error en dashboard-activity:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al cargar la actividad reciente.',
    });
  }
});
