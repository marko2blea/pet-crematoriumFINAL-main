// server/api/admin/reserva-detalle-editable.get.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const idParam = query.id as string;

  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la reserva.' });
  }

  const idReserva = parseInt(idParam);
  if (isNaN(idReserva) || idReserva < 1) {
    throw createError({ statusCode: 400, statusMessage: 'ID de reserva inválido.' });
  }

  try {
    const reservaDetalle = await db.reserva.findUnique({
      where: { id_reserva: idReserva },
      include: {
        pedido: {
          include: {
            usuario: true,
            envio: true,
            detalles_pedido: { include: { producto: true } },
          },
        },
        detalle_reserva: true,
        mascota: true,
      },
    });

    if (!reservaDetalle) {
      throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada.' });
    }

    if (!reservaDetalle.pedido) {
      console.error(
        `ERROR: Reserva #${idReserva} encontrada, pero el id_pedido está roto o es nulo.`
      );
      throw createError({
        statusCode: 404,
        statusMessage: `Reserva #${idReserva} encontrada, pero el pedido asociado es nulo.`,
      });
    }

    // MASCOTA
    let mascotaData = null;
    if (reservaDetalle.mascota) {
      mascotaData = {
        nombre: reservaDetalle.mascota.nombre_mascota || 'N/A',
        peso: reservaDetalle.mascota.peso
          ? reservaDetalle.mascota.peso.toNumber()
          : null,
        edad: reservaDetalle.mascota.edad ?? null,
      };
    }

    // SERVICIO PRINCIPAL (detalle_reserva)
    const detalleServicio = reservaDetalle.detalle_reserva;
    const nombreServicio = detalleServicio?.nombre_servicio || 'N/A';
    const tipoServicio = detalleServicio?.tipo_servicio || null;

    // PRODUCTOS ADICIONALES (solo productos, no el servicio)
    const productosComprados: {
      nombre: string;
      cantidad: number;
      precio: number;
      tipo: string;
    }[] = [];

    reservaDetalle.pedido.detalles_pedido.forEach((detalle) => {
      if (detalle.producto) {
        productosComprados.push({
          nombre: detalle.producto.nombre_producto || 'Ítem Desconocido',
          cantidad: detalle.cantidad,
          precio: detalle.precio_unitario
            ? detalle.precio_unitario.toNumber() * detalle.cantidad
            : 0,
          tipo: detalle.producto.tipo_producto || 'Producto',
        });
      }
    });

    // FECHAS
    const fechaReservadaISO =
      reservaDetalle.fecha_reservada?.toISOString().split('T')[0] || '';

    let horaReservadaISO = '';
    if (reservaDetalle.hora_reservada) {
      const hours = reservaDetalle.hora_reservada
        .getUTCHours()
        .toString()
        .padStart(2, '0');
      const minutes = reservaDetalle.hora_reservada
        .getUTCMinutes()
        .toString()
        .padStart(2, '0');
      horaReservadaISO = `${hours}:${minutes}`;
    }

    const envio = reservaDetalle.pedido.envio;
    const esEnvio = !!envio;

    const precioTotalNumerico = reservaDetalle.pedido.precio_total
      ? reservaDetalle.pedido.precio_total.toNumber()
      : 0;

    const usuario = reservaDetalle.pedido.usuario;

    return {
      id_reserva: reservaDetalle.id_reserva,
      cod_trazabilidad: reservaDetalle.cod_trazabilidad,
      estado_reserva: reservaDetalle.estado_reserva,
      fecha_reservada: fechaReservadaISO,
      hora_reservada: horaReservadaISO,
      precio_total: precioTotalNumerico,

      nombre_cliente: usuario?.nombre || 'Desconocido',
      correo_cliente: usuario?.correo || 'N/A',

      region: esEnvio ? envio!.region_envio : reservaDetalle.region || '',
      comuna: esEnvio ? envio!.comuna_envio : reservaDetalle.comuna || '',
      direccion: esEnvio ? envio!.direccion_envio : reservaDetalle.direccion || '',

      mascota_datos: mascotaData,

      // 🔥 para el bloque "Servicio Reservado"
      nombre_servicio: nombreServicio,
      tipo_servicio: tipoServicio,

      // 🔥 para el bloque "Productos Adicionales Comprados"
      productos_comprados: productosComprados,
    };
  } catch (error: any) {
    console.error('Error al obtener detalle de reserva (CRITICO):', error);

    if (error.statusCode) {
      // ya es un createError (404, 400, etc.)
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno al cargar la reserva: ${
        error.message || 'Error desconocido'
      }.`,
    });
  }
});
