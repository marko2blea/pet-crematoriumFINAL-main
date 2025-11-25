import { db } from '../utils/prisma';
import { Prisma } from '@prisma/client'; 

// 1. Define el Payload de Prisma con todos los includes necesarios
type PedidoFullTracking = Prisma.PedidoGetPayload<{
  include: {
    reserva: {
      include: {
        detalle_reserva: true; 
      };
    };
    envio: true; 
    pago: true; 
    detalles_pedido: {
      include: { producto: true }; 
    };
    usuario: true;
  };
}>;

// 2. Define la interfaz de la respuesta
interface TrackingResponse {
  codigo: string;
  item: string;
  fecha: string; // 🔥 Ahora contiene la cadena de fecha ISO
  estado: string;
  precioTotal: number;
}

// Lógica de utilidad para obtener clases CSS (sin cambios)
const getStatusColor = (estado: string): string => {
    estado = estado.toLowerCase();
    if (estado.includes('finalizad') || estado.includes('entregado')) return 'text-green-600 bg-green-100';
    if (estado.includes('asignad') || estado.includes('confirmad') || estado.includes('tránsito')) return 'text-blue-600 bg-blue-100';
    if (estado.includes('proceso') || estado.includes('esperando') || estado.includes('preparando')) return 'text-yellow-700 bg-yellow-200';
    if (estado.includes('pendiente')) return 'text-red-500 bg-red-100';
    if (estado.includes('cancelad')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
};


export default defineEventHandler(async (event): Promise<TrackingResponse> => {
  try {
    const query = getQuery(event);
    const codigo = query.codigo as string | undefined;

    if (!codigo) {
      throw createError({ statusCode: 400, statusMessage: 'Falta el código de trazabilidad.' });
    }

    let pedido: PedidoFullTracking | null = null;
    const isNumericCode = /^\d+$/.test(codigo);

    const includeQuery = {
        reserva: { include: { detalle_reserva: true } },
        envio: true, pago: true, usuario: true, 
        detalles_pedido: { include: { producto: true } },
    };

    // Búsqueda 1: por Reserva.cod_trazabilidad (Servicios)
    pedido = await db.pedido.findFirst({
      where: {
        reserva: { cod_trazabilidad: codigo },
      },
      include: includeQuery,
    });

    // Búsqueda 2: por id_pedido (Productos)
    if (!pedido && isNumericCode) {
         pedido = await db.pedido.findUnique({
            where: { id_pedido: Number(codigo) },
            include: includeQuery,
        });
    }

    if (!pedido) {
      throw createError({ statusCode: 404, statusMessage: 'Código de seguimiento no encontrado.' });
    }

    let estado: string = 'Pendiente'; 
    let fechaHora: string = 'N/A'; // Usaremos esta variable para la fecha ISO
    let nombreItem: string = 'Información no disponible';

    // Obtener el Nombre del Ítem (sin cambios)
    if (pedido.es_reserva && pedido.reserva?.detalle_reserva?.nombre_servicio) {
        nombreItem = pedido.reserva.detalle_reserva.nombre_servicio;
    } else if (pedido.detalles_pedido.length > 0 && pedido.detalles_pedido[0].producto?.nombre_producto) {
        nombreItem = pedido.detalles_pedido[0].producto.nombre_producto;
    } else if (pedido.detalles_pedido.length > 0) {
        nombreItem = `Producto(s) del Pedido #${pedido.id_pedido}`;
    }


    if (pedido.es_reserva && pedido.reserva) {
      // Lógica para Servicios
      const fechaReservada = pedido.reserva.fecha_reservada;
      if (fechaReservada) {
         // 🔥 CORRECCIÓN CLAVE 2: Enviar la fecha cruda (ISO string) al cliente
         fechaHora = fechaReservada.toISOString(); 
      } else {
         fechaHora = 'N/A';
      }

      switch (pedido.reserva.estado_reserva) {
        case 'Pendiente':
          estado = 'Reserva Pendiente de Respuesta del Administrador';
          break;
        case 'Confirmada':
          // 🔥 CORRECCIÓN CLAVE 1: Solo el estado, la fecha se pasa en el campo 'fecha'.
          estado = `Reserva Confirmada`;
          break;
        case 'En Proceso':
          estado = `Servicio En Proceso (Cremación)`;
          break;
        case 'Finalizada':
          estado = `Servicio Finalizado y Listo para Retiro/Entrega`;
          break;
        default:
          estado = `Estado de la Cremación: ${pedido.reserva.estado_reserva}`;
      }
      
    } else if (pedido.envio) {
      // Lógica para Producto con Envío a Domicilio (sin cambios)
      switch (pedido.envio.estado_envio) {
        case 'Pendiente':
          estado = 'Pedido Procesando. Esperando Despacho.';
          break;
        case 'En Proceso':
          estado = 'En Camino a Domicilio. En Tránsito.';
          break;
        case 'Finalizado':
          estado = 'Pedido Entregado a Domicilio.';
          break;
        default:
          estado = `Estado de Envío: ${pedido.envio.estado_envio}`;
      }
    } else {
      // Lógica para Producto con Retiro Local (Sin Envío) (sin cambios)
      const pagoEstado = pedido.pago?.estado;
      
      if (pagoEstado === 'Pagado' && pedido.estado_pedido === 'Pagado') {
          estado = 'Pago Confirmado. ¡Pedido Listo para Retiro en Local!';
      } else if (pagoEstado === 'Pendiente') {
          estado = 'Esperando Confirmación de Pago.';
      } else {
          estado = `Estado del Pago: ${pagoEstado || 'Desconocido'}`;
      }
    }

    // Devolver la respuesta unificada con la conversión del precio
    return {
      codigo: pedido.reserva?.cod_trazabilidad || codigo,
      item: nombreItem, 
      fecha: fechaHora, // Retorna la cadena ISO
      estado: estado,
      // FIX CLAVE: Convertir Decimal a number
      precioTotal: pedido.precio_total.toNumber(), 
    };

  } catch (error: any) {
    console.error('Error en tracking:', error);
    throw createError({
      statusCode: (error as { statusCode?: number }).statusCode || 500,
      statusMessage: (error as { statusMessage?: string }).statusMessage || 'Error interno al consultar el tracking.',
    });
  }
});