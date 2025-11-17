// server/api/checkout.post.ts
import { db } from '../utils/prisma';
import type { CartItem } from '../../app/types';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      formData,
      cartItems,
      cartTotal,
      userId
    } = body;

    if (!userId || !cartItems || (cartItems as CartItem[]).length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan datos de usuario o el carrito está vacío.' });
    }
    if (!formData.petName || !formData.region || !formData.comuna || !formData.direccion) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan datos de la mascota o dirección.' });
    }

    const esReserva = (cartItems as CartItem[]).some(item => item.tipo === 'Servicio');
    const totalConIVA = Math.round(cartTotal * 1.19);
    const cod_trazabilidad = `${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const transactionResult = await db.$transaction(async (tx) => {
      
      // 3.1. Crear la Mascota (con la FK al usuario)
      const nuevaMascota = await tx.mascota.create({
        data: {
          nombre_mascota: formData.petName,
          peso: Number(formData.petWeight) || 0,
          edad: Number(formData.petAge) || 0,
          id_especie: 1, 
          id_usuario: Number(userId), // <-- Lógica 1-a-N correcta
        },
      });

      // 3.2. (ELIMINADO) El bloque 'tx.usuario.update' que causaba el error se quita.

      // 3.3. Crear el Pago
      const nuevoPago = await tx.pago.create({
        data: {
          nombre_metodo: formData.metodoPago || 'Transferencia Bancaria',
          monto: totalConIVA,
          estado: 'Pendiente',
        },
      });

      // 3.4. Crear el Pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          id_usuario: Number(userId),
          id_pago: nuevoPago.id_pago,
          precio_total: totalConIVA,
          estado_pedido: 'Pendiente',
          es_reserva: esReserva,
        },
      });

      // 3.5. Crear los Detalles del Pedido
      await tx.detallePedido.createMany({
        data: (cartItems as CartItem[]).map(item => ({
          id_pedido: nuevoPedido.id_pedido,
          cod_producto: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio,
        })),
      });

      // 3.6. Crear la Reserva o el Envío
      if (esReserva) {
        await tx.reserva.create({
          data: {
            id_pedido: nuevoPedido.id_pedido,
            cod_trazabilidad: cod_trazabilidad,
            estado_reserva: 'Pendiente',
            region: formData.region,
            comuna: formData.comuna,
            direccion: formData.direccion,
          },
        });
      } else {
        await tx.envio.create({
          data: {
            id_pedido: nuevoPedido.id_pedido,
            region_envio: formData.region,
            comuna_envio: formData.comuna,
            direccion_envio: formData.direccion,
            estado_envio: 'Pendiente',
          },
        });
      }

      return {
        trackingCode: esReserva ? cod_trazabilidad : null,
        pedidoId: nuevoPedido.id_pedido
      };
    }); 

    return transactionResult;

  } catch (error: any) {
    console.error("Error en API de checkout:", error);
    if (error.statusCode) throw error;
    if (error.code) {
       throw createError({ statusCode: 500, statusMessage: `Error de base de datos: ${error.message}` });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al procesar la reserva.',
    });
  }
});