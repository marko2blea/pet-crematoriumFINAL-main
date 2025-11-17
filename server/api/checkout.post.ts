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

    if (!userId || !(cartItems as CartItem[]) || (cartItems as CartItem[]).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan datos de usuario o el carrito está vacío.'
      });
    }

    // Tipado explícito para evitar TS7006
    const items = cartItems as CartItem[];
    const isServiceOrder = items.some((item: CartItem) => item.tipo === 'Servicio');
    const isPickup = formData?.deliveryType === 'pickup';
    const totalConIVA = Number(cartTotal) * 1.19;

    const result = await db.$transaction(async (tx) => {
      // 1) Crear mascota si aplica
      let mascotaId: number | null = null;
      if (isServiceOrder) {
        const nuevaMascota = await tx.mascota.create({
          data: {
            nombre_mascota: formData?.petName || null,
            peso: Number(formData?.petWeight) || 0,
            edad: Number(formData?.petAge) || 0,
            id_especie: 1,                 // asegurar seed/registro 1 exista
            id_usuario: Number(userId),
          },
        });
        mascotaId = nuevaMascota.id_mascota;
      }

      // 2) Crear detalle_reserva
      const servicioNombre = items.map((it: CartItem) => it.nombre).join(' + ');
      const totalItems = items.reduce((s: number, it: CartItem) => s + (it.quantity || 0), 0);

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

      // 3) Crear pago (pendiente)
      const nuevoPago = await tx.pago.create({
        data: {
          nombre_metodo: formData?.metodoPago || 'Transferencia Bancaria',
          fecha_pago: new Date(),
          monto: new Prisma.Decimal(totalConIVA),
          estado: 'Pendiente',
          id_metodo: 1, // asegurar existe id 1 si lo usas
        },
      });

      // 4) Crear pedido (vincula usuario + pago)
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

      // 5) Generar código de trazabilidad si aplica
      const shouldGenerateTracking = isServiceOrder || !isPickup;
      const cod_trazabilidad = shouldGenerateTracking ? generateTrackingCode() : null;

      // 6) Crear reserva (vinculada al pedido creado)
      const nuevaReserva = await tx.reserva.create({
        data: {
          id_pedido: nuevoPedido.id_pedido,
          cod_trazabilidad: cod_trazabilidad, // tu schema permite String? entonces acepta null
          fecha_reservada: null,
          hora_reservada: null,

          // precios/estado según tu schema
          precio_total: new Prisma.Decimal(totalConIVA),

          // estado_reserva es String en tu schema (no boolean)
          estado_reserva: 'Pendiente',

          // ubicación (puede ser null)
          region: isPickup ? 'Retiro' : formData?.region || null,
          comuna: isPickup ? 'Tomé' : formData?.comuna || null,
          direccion: isPickup ? 'Oficina Central (Recogida)' : formData?.direccion || null,

          // relación al detalle
          id_detalle_reserva: nuevoDetalle.id_detalle_reserva,
        },
      });

      return {
        reservaId: nuevaReserva.id_reserva,
        trackingCode: nuevaReserva.cod_trazabilidad,
        pedidoId: nuevoPedido.id_pedido
      };
    });

    return result;
  } catch (error: any) {
    console.error('Error en checkout:', error);

    if (error?.statusCode) throw error;

    // Manejo de errores de Prisma
    if (error?.code === 'P2003') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error de integridad referencial (falta seed de Especie o Metodo_Pago requerido).'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Error interno al procesar el checkout.'
    });
  }
});
