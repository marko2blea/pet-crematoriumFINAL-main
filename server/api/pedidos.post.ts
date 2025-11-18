import { db } from '../utils/prisma';

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
  tipo: 'Producto' | 'Servicio';
  petName?: string;
  petWeight?: number;
  petAge?: number;
  direccion?: { region: string; comuna: string; direccion: string };
}

interface PedidoBody {
  id_usuario: number;
  cart: CartItem[];
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<PedidoBody>(event);
    if (!body || !body.cart || body.cart.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Carrito vacío o datos faltantes' });
    }

    const { id_usuario, cart } = body;
    const producto = cart.find(i => i.tipo === 'Producto');
    const servicio = cart.find(i => i.tipo === 'Servicio');

    const totalGeneral = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    const pedido = await db.pedido.create({
      data: {
        id_usuario,
        precio_total: totalGeneral,
        estado_pedido: 'Pendiente',
        es_reserva: !!servicio,
        detalles_pedido: producto ? {
          create: {
            cod_producto: producto.id,
            cantidad: producto.quantity,
            precio_unitario: producto.precio
          }
        } : undefined,
        reserva: servicio ? {
          create: {
            precio_total: servicio.precio * servicio.quantity,
            estado_reserva: 'Pendiente',
            region: servicio.direccion?.region,
            comuna: servicio.direccion?.comuna,
            direccion: servicio.direccion?.direccion
          }
        } : undefined
      },
      include: {
        detalles_pedido: true,
        reserva: true
      }
    });

    return {
      statusCode: 200,
      message: 'Pedido creado correctamente',
      id_pedido: pedido.id_pedido,
      cod_trazabilidad: pedido.reserva?.cod_trazabilidad || null
    };

  } catch (error) {
    console.error('Error en /api/pedidos:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al procesar el pedido'
    });
  }
});
