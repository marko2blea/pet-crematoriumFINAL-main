// server/api/checkout.post.ts
import { db } from '../utils/prisma';
import { Prisma } from '@prisma/client';
import type { CartItem } from '../../app/types';

// Generador simple de código de trazabilidad
function generateTrackingCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `${result.substring(0, 3)}-${result.substring(3, 8)}`;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { formData, cartItems, cartTotal, userId } = body;

    if (!userId || !cartItems || cartItems.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan datos de usuario o el carrito está vacío.'
      });
    }

    const items = cartItems as CartItem[];
    const isServiceOrder = items.some((item) => item.tipo === 'Servicio');
    const isPickup = formData?.deliveryType === 'pickup';
    const totalConIVA = Number(cartTotal) * 1.19;

    const result = await db.$transaction(async (tx) => {

      // 1) Crear Mascota si corresponde
      let mascotaId: number | null = null;
      if (isServiceOrder) {
        const nuevaMascota = await tx.mascota.create({
          data: {
            nombre_mascota: formData?.petName || null,
            peso: Number(formData?.petWeight) || 0,
            edad: Number(formData?.petAge) || 0,
            id_especie: 1, 
            id_usuario: Number(userId),
          },
        });
        mascotaId = nuevaMascota.id_mascota;
      }

      // 2) Crear detalle de la reserva
      const servicioNombre = items.map((i) => i.nombre).join(' + ');
      const totalItems = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

      const nuevoDetalle = await tx.detalle_Reserva.create({
        data: {
          nombre_servicio: servicioNombre,
          precio_servicio: Number(cartTotal),
          tipo_servicio: items[0]?.tipo || 'Producto',
          desc_servicio: `${totalItems} items en el pedido.`,
          cantidad: totalItems,
          precio_total: new Prisma.Decimal(totalConIVA),
          cod_producto: items[0]?.id ? Number(items[0].id) : null,
        },
      });

      // 3) Crear pago
      const nuevoPago = await tx.pago.create({
        data: {
          nombre_metodo: formData?.metodoPago || 'Transferencia Bancaria',
          fecha_pago: new Date(),
          monto: new Prisma.Decimal(totalConIVA),
          estado: 'Pendiente',
          id_metodo: 1,
        },
      });

      // 4) Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          id_usuario: Number(userId),
          id_pago: nuevoPago.id_pago,
          fecha_pedido: new Date(),
          precio_total: new Prisma.Decimal(totalConIVA),
          estado_pedido: 'Pendiente',
          es_reserva: true,
        },
      });

      // 5) Determinar si generar código de trazabilidad
      const shouldGenerateTracking = isServiceOrder || !isPickup;
      const trackingCode = shouldGenerateTracking ? generateTrackingCode() : null;

      // 6) Crear reserva
      const nuevaReserva = await tx.reserva.create({
        data: {
          id_pedido: nuevoPedido.id_pedido,
          cod_trazabilidad: trackingCode,
          fecha_reservada: null,
          hora_reservada: null,
          precio_total: new Prisma.Decimal(totalConIVA),
          estado_reserva: 'Pendiente',

          region: isPickup ? 'Retiro' : formData?.region || null,
          comuna: isPickup ? 'Tomé' : formData?.comuna || null,
          direccion: isPickup ? 'Oficina Central (Recogida)' : formData?.direccion || null,

          id_detalle_reserva: nuevoDetalle.id_detalle_reserva,
        },
      });

      return {
        reservaId: nuevaReserva.id_reserva,
        trackingCode: nuevaReserva.cod_trazabilidad,
        pedidoId: nuevoPedido.id_pedido,
      };
    });

    return result;

  } catch (error: any) {
    console.error('Error en checkout:', error);

    if (error?.statusCode) throw error;

    // Errores de integridad
    if (error?.code === 'P2003') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error de integridad referencial: faltan seeds requeridos (Especie o Método de Pago).'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Error interno al procesar el checkout.'
    });
  }
});
