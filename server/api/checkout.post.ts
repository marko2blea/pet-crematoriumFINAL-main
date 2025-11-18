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

    if (!userId || !cartItems || (cartItems as any[]).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan datos de usuario o el carrito está vacío.'
      });
    }

    const items = cartItems as CartItem[];
    const isServiceOrder = items.some(i => i.tipo === 'Servicio');
    const isPickup = formData?.deliveryType === 'pickup';
    const totalConIVA = Number(cartTotal) * 1.19;

    // Si frontend indica que el pago ya fue realizado en el checkout
    const paidNow = Boolean(formData?.paid === true);

    const result = await db.$transaction(async (tx) => {
      // 1) Crear Mascota si corresponde
      let mascotaId: number | null = null;
      if (isServiceOrder) {
        const nuevaMascota = await tx.mascota.create({
          data: {
            nombre_mascota: formData?.petName || null,
            peso: Number(formData?.petWeight) || 0,
            edad: Number(formData?.petAge) || 0,
            id_especie: 1, // asegúrate que exista
            id_usuario: Number(userId),
          },
        });
        mascotaId = nuevaMascota.id_mascota;
      }

      // 2) Crear detalle de la reserva
      const servicioNombre = items.map(i => i.nombre).join(' + ');
      const totalItems = items.reduce((acc, it) => acc + (it.quantity || 0), 0);

      const nuevoDetalle = await tx.detalle_Reserva.create({
        data: {
          nombre_servicio: servicioNombre || null,
          precio_servicio: Number(cartTotal) || 0,
          tipo_servicio: items[0]?.tipo || 'Producto',
          desc_servicio: `${totalItems} items en el pedido.`,
          cantidad: totalItems || 0,
          precio_total: new Prisma.Decimal(totalConIVA),
          cod_producto: items[0]?.id ? Number(items[0].id) : null,
        },
      });

      // 3) Crear pago (si paidNow = true lo marcamos como 'Pagado', si no 'Pendiente')
      const nuevoPago = await tx.pago.create({
        data: {
          nombre_metodo: formData?.metodoPago || 'Transferencia Bancaria',
          fecha_pago: new Date(),
          monto: new Prisma.Decimal(totalConIVA),
          estado: paidNow ? 'Pagado' : 'Pendiente',
          id_metodo: formData?.id_metodo ? Number(formData.id_metodo) : 1,
        },
      });

      // 4) Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          id_usuario: Number(userId),
          id_pago: nuevoPago.id_pago,
          fecha_pedido: new Date(),
          precio_total: new Prisma.Decimal(totalConIVA),
          estado_pedido: paidNow ? 'Pagado' : 'Pendiente',
          es_reserva: isServiceOrder ? true : (isPickup ? false : false),
        },
      });

      // 5) Determinar si generar código de trazabilidad
      const shouldGenerateTracking = isServiceOrder || !isPickup;
      const rawTracking = shouldGenerateTracking ? generateTrackingCode() : null;

      // 6) Crear reserva (si aplica)
      const nuevaReserva = await tx.reserva.create({
        data: {
          id_pedido: nuevoPedido.id_pedido,
          cod_trazabilidad: rawTracking ?? undefined,
          fecha_reservada: formData?.fechaReservada ? new Date(formData.fechaReservada) : null,
          hora_reservada: formData?.horaReservada ? new Date(formData.horaReservada) : null,
          precio_total: new Prisma.Decimal(totalConIVA),
          estado_reserva: paidNow ? 'Pagado' : 'Pendiente',
          region: isPickup ? 'Retiro' : formData?.region || null,
          comuna: isPickup ? 'Tomé' : formData?.comuna || null,
          direccion: isPickup ? 'Oficina Central (Recogida)' : formData?.direccion || null,
          id_detalle_reserva: nuevoDetalle.id_detalle_reserva,
        },
      });

      return {
        reservaId: nuevaReserva.id_reserva,
        trackingCode: nuevaReserva.cod_trazabilidad ?? null,
        pedidoId: nuevoPedido.id_pedido,
        pagoId: nuevoPago.id_pago,
      };
    });

    return result;
  } catch (error: any) {
    console.error('Error en checkout:', error);
    if (error?.statusCode) throw error;

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
