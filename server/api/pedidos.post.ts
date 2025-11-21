import { db } from '../utils/prisma';

// Definiciones de tipos necesarias para este endpoint
interface Direccion { 
  region: string; 
  comuna: string; 
  direccion: string; 
}
interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
  tipo: 'Producto' | 'Servicio' | 'Urna' | 'Accesorio'; 
  petName?: string;
  petWeight?: number;
  petAge?: number;
  direccion?: Direccion;
}
interface PedidoBody {
  id_usuario: number;
  cart: CartItem[];
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<PedidoBody>(event);
    if (!body || !body.cart || body.cart.length === 0 || !body.id_usuario) {
      throw createError({ statusCode: 400, statusMessage: 'Datos faltantes (id_usuario o carrito vacío).' });
    }

    const { id_usuario, cart } = body;
    const itemsProductos = cart.filter(i => i.tipo !== 'Servicio');
    const servicio = cart.find(i => i.tipo === 'Servicio');

    const totalGeneral = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    const detallesProducto = itemsProductos.map(p => ({
        cod_producto: p.id,
        cantidad: p.quantity,
        precio_unitario: p.precio,
    }));
    
    const reservaData = servicio ? {
        create: {
            precio_total: totalGeneral, 
            estado_reserva: 'Pendiente',
            region: servicio.direccion?.region,
            comuna: servicio.direccion?.comuna,
            direccion: servicio.direccion?.direccion
        }
    } : undefined;

    const pedido = await db.pedido.create({
      data: {
        id_usuario,
        precio_total: totalGeneral,
        estado_pedido: 'Pendiente',
        es_reserva: !!servicio,
        
        detalles_pedido: {
            create: detallesProducto
        },
        
        reserva: reservaData
      },
      include: {
        detalles_pedido: true,
        reserva: true
      }
    });

    return {
      statusCode: 201, // 201 Created
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