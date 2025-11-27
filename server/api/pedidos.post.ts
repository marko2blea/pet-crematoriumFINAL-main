// server/api/admin/pedidos.post.ts
import { db } from '../utils/prisma';
import { defineEventHandler, readBody, createError } from 'h3';

// ------------------------------------
// UTIL: Generar Código de Trazabilidad (9 chars)
// ------------------------------------
function generarCodTrazabilidad(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ------------------------------------
// DEFINICIÓN DE INTERFACES
// ------------------------------------

interface Direccion {
  tipo_entrega: 'DOMICILIO' | 'SUCURSAL';
  region?: string;
  comuna?: string;
  direccion?: string;
}

interface CartItem {
  id: string; // Código del Producto/Servicio
  nombre: string;
  precio: number;
  quantity: number;
  tipo: 'Producto' | 'Servicio';
  petName?: string;
  petWeight?: number;
  petAge?: number;
  direccion?: Direccion;
  costo_adicional?: number;
}

interface PedidoBody {
  id_usuario: number;
  cart: CartItem[];
  metodo_pago: string;
}

// ------------------------------------
// HANDLER
// ------------------------------------

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<PedidoBody>(event);

    if (!body.id_usuario || !body.cart || body.cart.length === 0 || !body.metodo_pago) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos del pedido incompletos o inválidos.',
      });
    }

    const { id_usuario, cart, metodo_pago } = body;

    const itemsProductos = cart.filter((i) => i.tipo !== 'Servicio');
    const servicio = cart.find((i) => i.tipo === 'Servicio');

    // Total base = suma de todos los ítems (productos + servicio si hay)
    let totalBase = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
    const costoAdicional = cart[0]?.costo_adicional || 0;
    const totalGeneralString = String(totalBase + costoAdicional);

    const logistica = cart[0]?.direccion;
    const esEnvioDomicilio = !servicio && logistica?.tipo_entrega === 'DOMICILIO';
    const estadoInicial = 'Pendiente';

    // Detalles de productos (para DetallePedido)
    const detallesProducto = itemsProductos.map((p) => ({
      cod_producto: Number(p.id), // asegurar INT
      cantidad: p.quantity,
      precio_unitario: String(p.precio),
    }));

    // Mascota (solo si hay servicio con datos de mascota)
    let mascotaCreationPromise: Promise<any> | null = null;
    if (servicio && servicio.petName) {
      mascotaCreationPromise = db.mascota.create({
        data: {
          nombre_mascota: servicio.petName,
          peso: servicio.petWeight !== undefined ? servicio.petWeight : undefined,
          edad: servicio.petAge !== undefined ? servicio.petAge : undefined,
          id_usuario: id_usuario,
        },
      });
    }

    // --- TRANSACCIÓN ---
    const results = await db.$transaction(async (tx) => {
      let idDetalleReserva: number | undefined = undefined;

      if (mascotaCreationPromise) await mascotaCreationPromise;

      // 1. Crear Detalle_Reserva solo si hay Servicio
      if (servicio) {
        const detalleReserva = await tx.detalle_Reserva.create({
          data: {
            nombre_servicio: servicio.nombre,
            precio_servicio: String(servicio.precio),
            tipo_servicio: servicio.tipo,
            cantidad: servicio.quantity,
            precio_total: String(servicio.precio * servicio.quantity),
          },
        });
        idDetalleReserva = detalleReserva.id_detalle_reserva;
      }

      // 2. Crear el Pago
      const pago = await tx.pago.create({
        data: {
          nombre_metodo: metodo_pago,
          monto: totalGeneralString,
          estado: estadoInicial,
        },
      });

      // 3. Crear el Pedido + Detalles + Reserva (siempre) + Envío (si aplica)
      const pedido = await tx.pedido.create({
        data: {
          id_usuario,
          id_pago: pago.id_pago,
          precio_total: totalGeneralString,
          estado_pedido: estadoInicial,
          es_reserva: !!servicio,

          // Detalles de productos
          detalles_pedido: { create: detallesProducto as any },

          // 🔥 SIEMPRE crear una RESERVA asociada, incluso si es solo productos
          reserva: {
            create: {
              precio_total: totalGeneralString,
              estado_reserva: estadoInicial,
              region: logistica?.region,
              comuna: logistica?.comuna,
              direccion: logistica?.direccion,
              id_detalle_reserva: idDetalleReserva, // si no hay servicio → queda null
              cod_trazabilidad: generarCodTrazabilidad(), // 🔥 para todos
            },
          },

          // Envío (solo si es envío a domicilio y NO es servicio)
          envio:
            esEnvioDomicilio && logistica
              ? {
                  create: {
                    region_envio: logistica.region ?? '',
                    comuna_envio: logistica.comuna ?? '',
                    direccion_envio: logistica.direccion ?? '',
                    estado_envio: estadoInicial,
                  },
                }
              : undefined,
        },
        include: {
          reserva: true,
        },
      });

      return pedido;
    });

    const pedido = results;

    return {
      statusCode: 201,
      message: 'Pedido creado correctamente',
      id_pedido: pedido.id_pedido,
      id_reserva: pedido.reserva?.id_reserva ?? null,
      cod_trazabilidad: pedido.reserva?.cod_trazabilidad || null,
    };
  } catch (error) {
    console.error('Error en el endpoint de creación de pedidos:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al procesar el pedido. Revise logs del servidor.',
    });
  }
});
