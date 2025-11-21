// server/api/pedidos.post.ts
import { db } from '../utils/prisma';
import { createError } from 'h3';

// Definiciones de tipos necesarias para este endpoint
interface Direccion { 
    region: string; 
    comuna: string; 
    direccion: string; 
    tipo_entrega: 'DOMICILIO' | 'RETIRO'; 
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
    costo_adicional?: number; // Campo del frontend
}
interface PedidoBody {
    id_usuario: number;
    cart: CartItem[];
    metodo_pago: string; // Nuevo
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<PedidoBody>(event);
        if (!body || !body.cart || body.cart.length === 0 || !body.id_usuario) {
            throw createError({ statusCode: 400, statusMessage: 'Datos faltantes (id_usuario o carrito vacío).' });
        }

        const { id_usuario, cart, metodo_pago } = body;
        const itemsProductos = cart.filter(i => i.tipo !== 'Servicio');
        const servicio = cart.find(i => i.tipo === 'Servicio');

        // --- CALCULAR TOTAL GENERAL (Incluye Costo Adicional) ---
        let totalBase = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        
        // El costo adicional y logística están en el primer ítem
        const costoAdicional = cart[0].costo_adicional || 0; 
        const logistica = cart[0].direccion;
        
        const totalGeneral = totalBase + costoAdicional;


        // --- 1. Preparar Mascota (Si es Servicio) ---
        let mascotaCreationPromise = null;
        if (servicio && servicio.petName) {
            mascotaCreationPromise = db.mascota.create({
                data: {
                    nombre_mascota: servicio.petName,
                    peso: servicio.petWeight,
                    edad: servicio.petAge,
                    id_usuario: id_usuario, 
                }
            });
        }
        
        // --- 2. Preparar Reserva Data (Servicio) ---
        // La dirección de la Reserva es la del retiro de la mascota/entrega final
        const reservaData = servicio ? {
            create: {
                precio_total: totalGeneral, // Se puede usar totalGeneral si el servicio cubre todo
                estado_reserva: 'Pendiente',
                // Usar la dirección de la Logística
                region: logistica?.region,
                comuna: logistica?.comuna,
                direccion: logistica?.direccion,
            }
        } : undefined;

        // --- 3. Preparar Envio Data (Solo si es Producto Y no hay servicio, y es a Domicilio) ---
        // Si hay servicio, no creamos Envío, ya que la logística la lleva la Reserva
        let envioData = undefined;

        if (!servicio && logistica?.tipo_entrega === 'DOMICILIO') {
             envioData = {
                create: {
                    region_envio: logistica.region,
                    comuna_envio: logistica.comuna,
                    direccion_envio: logistica.direccion,
                    estado_envio: 'Pendiente',
                }
            };
        }


        // --- 4. Creación del Pedido y Transacción ---
        const transactionSteps = [];
        if (mascotaCreationPromise) transactionSteps.push(mascotaCreationPromise);

        transactionSteps.push(
            db.pedido.create({
                data: {
                    id_usuario,
                    precio_total: totalGeneral,
                    estado_pedido: 'Pendiente',
                    es_reserva: !!servicio,
                    
                    detalles_pedido: { 
                        create: itemsProductos.map(p => ({
                            cod_producto: p.id,
                            cantidad: p.quantity,
                            precio_unitario: p.precio,
                        }))
                    },
                    reserva: reservaData,
                    envio: envioData,
                },
                include: {
                    detalles_pedido: true,
                    reserva: true,
                    envio: true,
                }
            })
        );
        
        const results = await db.$transaction(transactionSteps as any);
        const pedido = results.find((r: any) => r.id_pedido) || results[results.length - 1]; 

        return {
            statusCode: 201, 
            message: 'Pedido creado correctamente',
            id_pedido: pedido.id_pedido, 
            cod_trazabilidad: pedido.reserva?.cod_trazabilidad || null
        };

    } catch (error) {
        console.error('Error en /api/pedidos:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al procesar el pedido. Revise logs del servidor.'
        });
    }
});