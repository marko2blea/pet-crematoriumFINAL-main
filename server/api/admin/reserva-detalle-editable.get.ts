// server/api/admin/reserva-detalle-editable.get.ts
import { db } from '../../utils/prisma';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const idParam = query.id as string;

  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el ID del pedido.' });
  }

  const idPedido = parseInt(idParam);
  if (isNaN(idPedido) || idPedido < 1) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pedido inválido.' });
  }

  try {
    const pedido = await db.pedido.findUnique({
      where: { id_pedido: idPedido },
      include: {
        usuario: true,
        envio: true,
        detalles_pedido: {
          include: { producto: true },
        },
        reserva: {
          include: {
            detalle_reserva: true,
            mascota: true,
          },
        },
      },
    });

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado.' });
    }

    const reserva = pedido.reserva || null;
    const esReserva = !!pedido.es_reserva; // 🔥 CLAVE: usamos el flag que guardamos al crear el pedido

    // ---------- PRODUCTOS COMPRADOS ----------
    const productosComprados: {
      nombre: string;
      cantidad: number;
      precio: number;
      tipo: string;
    }[] = [];

    pedido.detalles_pedido.forEach((detalle) => {
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

    // ---------- CAMPOS SEGÚN SI ES RESERVA (SERVICIO) O SOLO PRODUCTO ----------
    let id_reserva: number | null = null;
    let cod_trazabilidad: string | null = null;
    let estado_reserva = '';
    let fechaReservadaISO = '';
    let horaReservadaISO = '';
    let mascotaData: { nombre: string; peso: number | null; edad: number | null } | null =
      null;
    let nombreServicio: string | undefined = undefined;
    let tipoServicio: string | undefined = undefined;

    if (esReserva && reserva) {
      // ----- CASO: SERVICIO -----
      id_reserva = reserva.id_reserva;
      cod_trazabilidad = reserva.cod_trazabilidad || null;
      estado_reserva = reserva.estado_reserva;

      if (reserva.fecha_reservada) {
        fechaReservadaISO = reserva.fecha_reservada.toISOString().split('T')[0];
      }

      if (reserva.hora_reservada) {
        const hours = reserva.hora_reservada
          .getUTCHours()
          .toString()
          .padStart(2, '0');
        const minutes = reserva.hora_reservada
          .getUTCMinutes()
          .toString()
          .padStart(2, '0');
        horaReservadaISO = `${hours}:${minutes}`;
      }

      if (reserva.mascota) {
        mascotaData = {
          nombre: reserva.mascota.nombre_mascota || 'N/A',
          peso: reserva.mascota.peso ? reserva.mascota.peso.toNumber() : null,
          edad: reserva.mascota.edad ?? null,
        };
      }

      if (reserva.detalle_reserva) {
        nombreServicio = reserva.detalle_reserva.nombre_servicio || 'Servicio Principal';
        tipoServicio = reserva.detalle_reserva.tipo_servicio || undefined;
      }
    } else {
      // ----- CASO: SOLO PRODUCTOS -----
      id_reserva = reserva ? reserva.id_reserva : null;
      cod_trazabilidad = reserva?.cod_trazabilidad || null;
      estado_reserva = pedido.estado_pedido; // usamos el estado del pedido como "estado_reserva"
      fechaReservadaISO = '';
      horaReservadaISO = '';
      mascotaData = null;
      nombreServicio = undefined;
      tipoServicio = undefined;
    }

    // ---------- DIRECCIÓN ----------
    const envio = pedido.envio;
    const region = envio ? envio.region_envio : reserva?.region || '';
    const comuna = envio ? envio.comuna_envio : reserva?.comuna || '';
    const direccion = envio ? envio.direccion_envio : reserva?.direccion || '';

    const precioTotalNumerico = pedido.precio_total
      ? pedido.precio_total.toNumber()
      : 0;

    const usuario = pedido.usuario;

    // ---------- RESPUESTA FINAL ----------
    return {
      id_pedido: pedido.id_pedido,
      id_reserva,
      es_reserva: esReserva, // 🔥 ESTO es lo que usa el front para saber si mostrar fecha/hora

      cod_trazabilidad,
      estado_reserva,
      fecha_reservada: fechaReservadaISO,
      hora_reservada: horaReservadaISO,
      precio_total: precioTotalNumerico,

      nombre_cliente: usuario?.nombre || 'Desconocido',
      correo_cliente: usuario?.correo || 'N/A',

      region,
      comuna,
      direccion,

      mascota_datos: mascotaData,

      nombre_servicio: nombreServicio,
      tipo_servicio: tipoServicio,

      productos_comprados: productosComprados,
    };
  } catch (error: any) {
    console.error('Error al obtener detalle de reserva/pedido (CRITICO):', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno al cargar la reserva/pedido: ${
        error.message || 'Error desconocido'
      }.`,
    });
  }
});
