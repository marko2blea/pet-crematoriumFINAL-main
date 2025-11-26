// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// URLs de imágenes placeholder aleatorias (simulan imágenes de Google)
const PLACEHOLDER_URL = "https://picsum.photos/seed/";

async function main() {
  console.log("🌱 Iniciando seed...");

  // =====================================================
  // 1. ROLES
  // =====================================================
  const rolCliente = await db.rol.upsert({
    where: { id_rol: 1 },
    update: {},
    create: { id_rol: 1, nombre_rol: "Cliente" },
  });

  const rolAdmin = await db.rol.upsert({
    where: { id_rol: 2 },
    update: {},
    create: { id_rol: 2, nombre_rol: "Admin" },
  });

  console.log("✔ Roles listos");

  // =====================================================
  // 2. USUARIOS (Actualizado)
  // =====================================================

  const adminPassword = await bcrypt.hash("admin1234", 10);
  const userPassword1 = await bcrypt.hash("marco1234", 10);
  const userPassword2 = await bcrypt.hash("fran1234", 10);
  const userPassword3 = await bcrypt.hash("nico1234", 10);

  const admin = await db.usuario.upsert({
    where: { correo: "admin@gmail.com" },
    update: {},
    create: {
      nombre: "Admin",
      apellido_paterno: "Principal",
      correo: "admin@gmail.com",
      contrase_a: adminPassword,
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });

  const clienteMarco = await db.usuario.upsert({
    where: { correo: "marco.araneda1@virginiogomez.cl" },
    update: {},
    create: {
      nombre: "Marco",
      apellido_paterno: "Araneda",
      correo: "marco.araneda1@virginiogomez.cl",
      contrase_a: userPassword1,
      id_rol: rolCliente.id_rol,
      fecha_registro: new Date(),
    },
  });

  const clienteFrancisca = await db.usuario.upsert({
    where: { correo: "francisca.gatica2@virginiogomez.cl" },
    update: {},
    create: {
      nombre: "Francisca",
      apellido_paterno: "Gatica",
      correo: "francisca.gatica2@virginiogomez.cl",
      contrase_a: userPassword2,
      id_rol: rolCliente.id_rol,
      fecha_registro: new Date(),
    },
  });

  const clienteNicolas = await db.usuario.upsert({
    where: { correo: "nicolas.quinchavil@virginiogomez.cl" },
    update: {},
    create: {
      nombre: "Nicolas",
      apellido_paterno: "Quinchavil",
      correo: "nicolas.quinchavil@virginiogomez.cl",
      contrase_a: userPassword3,
      id_rol: rolCliente.id_rol,
      fecha_registro: new Date(),
    },
  });

  console.log("✔ Usuarios creados");

  // =====================================================
  // 3. PROVEEDOR
  // =====================================================
  const proveedor = await db.proveedor.upsert({
    where: { id_proveedor: 1 },
    update: {},
    create: {
      id_proveedor: 1,
      proveedor: "Proveedor General",
      disponible: true,
    },
  });

  console.log("✔ Proveedor creado");

  // =====================================================
  // 4. PRODUCTOS (Servicios, Urnas y Accesorios)
  // =====================================================

  // ❌ CREMACIÓN SIMPLE ELIMINADA (ID 1)
  await db.producto.delete({ where: { cod_producto: 1 } }).catch(() => {});

  // 4.1 SERVICIOS BASE
  const prodTradicional = await db.producto.upsert({
    where: { cod_producto: 4 },
    update: {},
    create: {
      cod_producto: 4,
      nombre_producto: "Cremación Tradicional",
      precio_unitario: 165000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "Servicio de cremación con entrega de cenizas en urna sencilla y certificado.",
    },
  });

  const prodPresencial = await db.producto.upsert({
    where: { cod_producto: 7 },
    update: {},
    create: {
      cod_producto: 7,
      nombre_producto: "Cremación Presencial",
      precio_unitario: 250000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "OPCIÓN PARA PRESENCIAR EL PROCESO EN NUESTRA SALA DE DESPEDIDA",
    },
  });

  const prodEutanasia = await db.producto.upsert({
    where: { cod_producto: 8 },
    update: {},
    create: {
      cod_producto: 8,
      nombre_producto: "Servicio Eutanasia",
      precio_unitario: 75000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "REALIZADO POR PERSONAL MÉDICO VETERINARIO CALIFICADO",
    },
  });
  
  // 4.2 URNAS
  const prodUrnaMadera = await db.producto.upsert({
    where: { cod_producto: 2 },
    update: { imagen_url: `${PLACEHOLDER_URL}urna1/400/300` },
    create: {
      cod_producto: 2,
      nombre_producto: "Urna Madera Natural",
      precio_unitario: 40000,
      stock_actual: 20,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna simple fabricada en madera nacional.",
      imagen_url: `${PLACEHOLDER_URL}urna1/400/300`,
    },
  });

  // 💥 NUEVA URNA
  const prodUrnaMarmol = await db.producto.upsert({
    where: { cod_producto: 5 },
    update: {},
    create: {
      cod_producto: 5,
      nombre_producto: "Urna de Mármol Premium",
      precio_unitario: 80000,
      stock_actual: 15,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna de mármol pulido, elegante y duradera.",
      imagen_url: `${PLACEHOLDER_URL}urna2/400/300`,
    },
  });

  // 4.3 ACCESORIOS
  const prodCollar = await db.producto.upsert({
    where: { cod_producto: 3 },
    update: { imagen_url: `${PLACEHOLDER_URL}collar1/400/300` },
    create: {
      cod_producto: 3,
      nombre_producto: "Collar Recuerdo",
      precio_unitario: 25000,
      stock_actual: 40,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Collar para almacenar parte de las cenizas.",
      imagen_url: `${PLACEHOLDER_URL}collar1/400/300`,
    },
  });

  // 💥 NUEVO ACCESORIO
  const prodLlavero = await db.producto.upsert({
    where: { cod_producto: 6 },
    update: {},
    create: {
      cod_producto: 6,
      nombre_producto: "Llavero Cenizas Huella",
      precio_unitario: 35000,
      stock_actual: 30,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Llavero con forma de huella para llevar un recuerdo de tu mascota.",
      imagen_url: `${PLACEHOLDER_URL}llavero/400/300`,
    },
  });

  console.log("✔ Productos y Servicios creados");

  // =====================================================
  // 5. ESPECIES
  // =====================================================
  const especiePerro = await db.especie.upsert({
    where: { id_especie: 1 },
    update: {},
    create: { id_especie: 1, nombre_especie: "Perro" },
  });

  await db.especie.upsert({
    where: { id_especie: 2 },
    update: {},
    create: { id_especie: 2, nombre_especie: "Gato" },
  });

  await db.especie.upsert({
    where: { id_especie: 3 },
    update: {},
    create: { id_especie: 3, nombre_especie: "Ave" },
  });

  console.log("✔ Especies creadas");

  // =====================================================
  // 6. MÉTODOS DE PAGO
  // =====================================================
  const metodoTarjeta = await db.metodo_Pago.upsert({
    where: { id_metodo: 1 },
    update: {},
    create: { id_metodo: 1, nombre_metodo: "Tarjeta de Crédito" },
  });

  await db.metodo_Pago.upsert({
    where: { id_metodo: 2 },
    update: {},
    create: { id_metodo: 2, nombre_metodo: "Débito" },
  });

  await db.metodo_Pago.upsert({
    where: { id_metodo: 3 },
    update: {},
    create: { id_metodo: 3, nombre_metodo: "Transferencia Bancaria" },
  });

  console.log("✔ Métodos de pago listos");

  // =====================================================
  // 7. INSTALACIONES
  // =====================================================
  await db.instalacion.deleteMany({});
  await db.instalacion.createMany({
    data: [
      {
        title: "Sala de Despedida",
        body: "Un espacio tranquilo para acompañar a tus mascotas en su despedida.",
        features: ["Aromaterapia", "Iluminación cálida", "Sillas cómodas"],
        imagen_url: `${PLACEHOLDER_URL}sala/800/600`,
      },
      {
        title: "Horno Crematorio",
        body: "Equipo certificado de última generación, seguro y eficiente.",
        features: ["Certificado SEC", "Alta eficiencia térmica", "Proceso controlado"],
        imagen_url: `${PLACEHOLDER_URL}horno/800/600`,
      },
      {
        title: "Jardín del Recuerdo",
        body: "Un espacio exterior para reflexionar y despedirse.",
        features: ["Árboles nativos", "Bancas", "Zona de descanso"],
        imagen_url: `${PLACEHOLDER_URL}jardin/800/600`,
      },
    ],
  });

  console.log("✔ Instalaciones creadas");

  // =====================================================
  // 8. MEMORIAL (Solo 2 ejemplos)
  // =====================================================
  await db.memorial.deleteMany({});
  await db.memorial.createMany({
    data: [
      {
        nombre: "Firulais",
        raza: "Labrador",
        fecha: new Date("2023-10-14"),
        dedicatoria: "Gracias por tantos años de felicidad, fuiste el mejor amigo.",
      },
      {
        nombre: "Michi",
        raza: "Gato Atigrado",
        fecha: new Date("2024-01-08"),
        dedicatoria: "Siempre en nuestros corazones, te extrañaremos Michi.",
      },
    ],
  });

  console.log("✔ Memorial creado (2 ejemplos)");

  // =====================================================
  // 9. ABOUT BLOCK
  // =====================================================
  await db.aboutBlock.deleteMany({});
  await db.aboutBlock.createMany({
    data: [
      {
        title: "Nuestra Misión",
        body: "Brindar un servicio digno, respetuoso y profesional para despedir a las mascotas que forman parte de nuestras familias.",
        items: ["Acompañamiento", "Respeto", "Profesionalismo"],
        imagen_url: `${PLACEHOLDER_URL}mision/600/400`,
      },
      {
        title: "Nuestros Valores",
        body: "Trabajamos con transparencia, empatía y dedicación para entregar tranquilidad en momentos difíciles.",
        items: ["Transparencia", "Empatía", "Dedicación"],
        imagen_url: `${PLACEHOLDER_URL}valores/600/400`,
      },
      {
        title: "Nuestra Historia",
        body: "Más de diez años entregando un servicio humano y comprometido con cada familia.",
        items: ["Fundado en 2013", "Cientos de familias acompañadas", "Crecimiento constante"],
        imagen_url: `${PLACEHOLDER_URL}historia/600/400`,
      },
    ],
  });

  console.log("✔ AboutBlock creado");

  // =====================================================
  // 10. RESERVA / PEDIDO DE EJEMPLO (Corregido el Flujo de Relaciones)
  // =====================================================

  // 10.1 Mascota de ejemplo (Dueño: Marco)
  const mascotaEjemplo = await db.mascota.create({
    data: {
      nombre_mascota: "Max",
      peso: 15.5, 
      edad: 7, 
      id_especie: especiePerro.id_especie,
      id_usuario: clienteMarco.id_usuario, // Asignado a Marco
    },
  });

  // 10.2 Creación del Detalle de Reserva (Debe crearse primero para obtener su ID)
  // Detalles: Cremación Tradicional + Urna Madera
  const detalleCremacion = await db.detalle_Reserva.create({
    data: {
      nombre_servicio: prodTradicional.nombre_producto,
      precio_servicio: prodTradicional.precio_unitario!,
      tipo_servicio: prodTradicional.tipo_producto,
      desc_servicio: prodTradicional.descripcion,
      cantidad: 1,
      precio_total: prodTradicional.precio_unitario!,
      cod_producto: prodTradicional.cod_producto,
    },
  });
  
  const detalleUrna = await db.detalle_Reserva.create({
    data: {
      nombre_servicio: prodUrnaMadera.nombre_producto,
      precio_servicio: prodUrnaMadera.precio_unitario!,
      tipo_servicio: prodUrnaMadera.tipo_producto,
      desc_servicio: prodUrnaMadera.descripcion,
      cantidad: 1,
      precio_total: prodUrnaMadera.precio_unitario!,
      cod_producto: prodUrnaMadera.cod_producto,
    },
  });
  
  // Cálculo del total
  const totalReserva = detalleCremacion.precio_total!.toNumber() + detalleUrna.precio_total!.toNumber();
  const costoEnvio = 5000;
  const totalPedido = totalReserva + costoEnvio; 

  // 10.3 Creación de PEDIDO (Padre de la Reserva)
  const pedidoEjemplo = await db.pedido.create({
    data: {
      id_usuario: clienteMarco.id_usuario!,
      precio_total: totalPedido,
      estado_pedido: "Completado",
      es_reserva: true,
    },
  });

  // 10.4 Creación de RESERVA (Hija del Pedido)
  const reservaEjemplo = await db.reserva.create({
    data: {
      id_pedido: pedidoEjemplo.id_pedido,
      cod_trazabilidad: "TRCK2025001", 
      fecha_reservada: new Date(),
      estado_reserva: "Confirmado",
      precio_total: totalReserva,
      id_mascota: mascotaEjemplo.id_mascota,
      region: "Metropolitana",
      comuna: "Santiago",
      direccion: "Calle Falsa 123",
      // ✅ Se conecta la Reserva al Detalle de Reserva
      id_detalle_reserva: detalleCremacion.id_detalle_reserva, 
    },
  });

  // 10.5 Pago
  const pagoEjemplo = await db.pago.create({
    data: {
      monto: totalPedido, 
      fecha_pago: new Date(),
      estado: "Pagado",
      id_metodo: metodoTarjeta.id_metodo,
      nombre_metodo: metodoTarjeta.nombre_metodo, 
      pedido: { connect: { id_pedido: pedidoEjemplo.id_pedido } },
    },
  });
  
  // 10.6 Actualizar el Pedido con el ID de Pago
  await db.pedido.update({
    where: { id_pedido: pedidoEjemplo.id_pedido },
    data: { id_pago: pagoEjemplo.id_pago },
  });

  // 10.7 Envío
  await db.envio.create({
    data: {
      id_pedido: pedidoEjemplo.id_pedido,
      region_envio: "Metropolitana",
      comuna_envio: "Santiago",
      direccion_envio: "Calle Falsa 123",
      estado_envio: "En Tránsito",
      // No se incluye costo_envio porque no existe en el esquema Envio
    },
  });

  console.log("✔ Reserva de ejemplo (TRCK2025001) creada y pagada");

  console.log("🌱 Seed COMPLETADO");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });