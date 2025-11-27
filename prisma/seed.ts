// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Se eliminó PLACEHOLDER_URL. Usaremos rutas relativas a /public/

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
  // 2. USUARIOS
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
  // 4. PRODUCTOS (Servicios, Urnas y Accesorios) - IMÁGENES CORREGIDAS
  // =====================================================

  // ❌ CREMACIÓN SIMPLE ELIMINADA (ID 1)
  await db.producto.delete({ where: { cod_producto: 1 } }).catch(() => {});

  // 4.1 SERVICIOS BASE
  const prodTradicional = await db.producto.upsert({
    where: { cod_producto: 4 },
    update: { imagen_url: '/servicio2.jpg' }, // Imagen corregida
    create: {
      cod_producto: 4,
      nombre_producto: "Cremación Tradicional",
      precio_unitario: 165000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "Servicio de cremación con entrega de cenizas en urna sencilla y certificado.",
      imagen_url: '/servicio2.jpg', // Imagen corregida
    },
  });

  const prodPresencial = await db.producto.upsert({
    where: { cod_producto: 7 },
    update: { imagen_url: '/servicio1.jpg' }, // Imagen corregida
    create: {
      cod_producto: 7,
      nombre_producto: "Cremación Presencial",
      precio_unitario: 250000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "OPCIÓN PARA PRESENCIAR EL PROCESO EN NUESTRA SALA DE DESPEDIDA",
      imagen_url: '/servicio1.jpg', // Imagen corregida
    },
  });

  const prodEutanasia = await db.producto.upsert({
    where: { cod_producto: 8 },
    update: { imagen_url: '/servicio3.jpg' }, // Imagen corregida
    create: {
      cod_producto: 8,
      nombre_producto: "Servicio Eutanasia",
      precio_unitario: 75000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "REALIZADO POR PERSONAL MÉDICO VETERINARIO CALIFICADO",
      imagen_url: '/servicio3.jpg', // Imagen corregida
    },
  });
  
  // 4.2 URNAS
  const prodUrnaMadera = await db.producto.upsert({
    where: { cod_producto: 2 },
    update: { imagen_url: '/urna1.jpg' }, // Imagen corregida
    create: {
      cod_producto: 2,
      nombre_producto: "Urna Madera Natural",
      precio_unitario: 40000,
      stock_actual: 20,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna simple fabricada en madera nacional.",
      imagen_url: '/urna1.jpg', // Imagen corregida
    },
  });

  // 💥 NUEVA URNA
  const prodUrnaMarmol = await db.producto.upsert({
    where: { cod_producto: 5 },
    update: { imagen_url: '/urna2.jpg' }, // Imagen corregida
    create: {
      cod_producto: 5,
      nombre_producto: "Urna de Mármol Premium",
      precio_unitario: 80000,
      stock_actual: 15,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna de mármol pulido, elegante y duradera.",
      imagen_url: '/urna2.jpg', // Imagen corregida
    },
  });

  // 4.3 ACCESORIOS
  const prodCollar = await db.producto.upsert({
    where: { cod_producto: 3 },
    update: { imagen_url: '/accesorio1.jpg' }, // Imagen corregida
    create: {
      cod_producto: 3,
      nombre_producto: "Collar Recuerdo",
      precio_unitario: 25000,
      stock_actual: 40,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Collar para almacenar parte de las cenizas.",
      imagen_url: '/accesorio1.jpg', // Imagen corregida
    },
  });

  // 💥 NUEVO ACCESORIO
  const prodLlavero = await db.producto.upsert({
    where: { cod_producto: 6 },
    update: { imagen_url: '/accesorio2.jpg' }, // Imagen corregida (usando /accesorio2.jpg como placeholder)
    create: {
      cod_producto: 6,
      nombre_producto: "Llavero Cenizas Huella",
      precio_unitario: 35000,
      stock_actual: 30,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Llavero con forma de huella para llevar un recuerdo de tu mascota.",
      imagen_url: '/accesorio2.jpg', // Imagen corregida
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
  // 7. INSTALACIONES - IMÁGENES CORREGIDAS
  // =====================================================
  await db.instalacion.deleteMany({});
  await db.instalacion.createMany({
    data: [
      {
        title: "Sala de Despedida",
        body: "Un espacio tranquilo para acompañar a tus mascotas en su despedida.",
        features: ["Aromaterapia", "Iluminación cálida", "Sillas cómodas"],
        imagen_url: '/instalacion1.jpg', // Imagen corregida
      },
      {
        title: "Horno Crematorio",
        body: "Equipo certificado de última generación, seguro y eficiente.",
        features: ["Certificado SEC", "Alta eficiencia térmica", "Proceso controlado"],
        imagen_url: '/instalacion2.jpg', // Imagen corregida
      },
      {
        title: "Jardín del Recuerdo",
        body: "Un espacio exterior para reflexionar y despedirse.",
        features: ["Árboles nativos", "Bancas", "Zona de descanso"],
        imagen_url: '/instalacion3.jpg', // Imagen corregida
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
  // 9. ABOUT BLOCK - IMÁGENES CORREGIDAS
  // =====================================================
  await db.aboutBlock.deleteMany({});
  await db.aboutBlock.createMany({
    data: [
      {
        title: "Nuestra Misión",
        body: "Brindar un servicio digno, respetuoso y profesional para despedir a las mascotas que forman parte de nuestras familias.",
        items: ["Acompañamiento", "Respeto", "Profesionalismo"],
        imagen_url: '/mision.jpg', // Imagen corregida
      },
      {
        title: "Nuestros Valores",
        body: "Trabajamos con transparencia, empatía y dedicación para entregar tranquilidad en momentos difíciles.",
        items: ["Transparencia", "Empatía", "Dedicación"],
        imagen_url: '/valores.jpg', // Imagen corregida
      },
      {
        title: "Nuestra Historia",
        body: "Más de diez años entregando un servicio humano y comprometido con cada familia.",
        items: ["Fundado en 2013", "Cientos de familias acompañadas", "Crecimiento constante"],
        imagen_url: '/historia.jpg', // Imagen corregida
      },
    ],
  });

  console.log("✔ AboutBlock creado");

  // =====================================================
  // 10. RESERVA / PEDIDO DE EJEMPLO
  // =====================================================
  // 🔥 NOTA IMPORTANTE: Esta sección de reserva de ejemplo ha sido ELIMINADA 
  // para cumplir con tu solicitud de quitar el ejemplo que no funciona.
  

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

