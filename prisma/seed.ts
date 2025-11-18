// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

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
  // 2. USUARIOS (CONTRASEÑA ENCRIPTADA)
  // =====================================================

  const adminPassword = await bcrypt.hash("admin1234", 10);

  await db.usuario.upsert({
    where: { correo: "admin@gmail.com" },
    update: {},
    create: {
      nombre: "Admin",
      apellido_paterno: "Principal",
      correo: "admin@gmail.com",
      contrase_a: adminPassword, // 🔐 ENCRIPTADA
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });

  await db.usuario.upsert({
    where: { correo: "cliente@gmail.com" },
    update: {},
    create: {
      nombre: "Cliente",
      apellido_paterno: "Ejemplo",
      correo: "cliente@gmail.com",
      contrase_a: await bcrypt.hash("cliente123", 10), // 🔐 ENCRIPTADA
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
  // 4. PRODUCTOS
  // =====================================================
  await db.producto.upsert({
    where: { cod_producto: 1 },
    update: {},
    create: {
      cod_producto: 1,
      nombre_producto: "Cremación Simple",
      precio_unitario: 150000,
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "Servicio básico de cremación digna.",
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 2 },
    update: {},
    create: {
      cod_producto: 2,
      nombre_producto: "Urna Madera Natural",
      precio_unitario: 40000,
      stock_actual: 20,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna simple fabricada en madera nacional.",
      imagen_url: "urna1.jpg",
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 3 },
    update: {},
    create: {
      cod_producto: 3,
      nombre_producto: "Collar Recuerdo",
      precio_unitario: 25000,
      stock_actual: 40,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Collar para almacenar parte de las cenizas.",
      imagen_url: "collar1.jpg",
    },
  });

  console.log("✔ Productos creados");

  // =====================================================
  // 5. ESPECIES
  // =====================================================
  await db.especie.upsert({
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
  await db.metodo_Pago.upsert({
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
  // 7. INSTALACIONES (COMPLETAS)
  // =====================================================
  await db.instalacion.createMany({
    data: [
      {
        title: "Sala de Despedida",
        body: "Un espacio tranquilo para acompañar a tus mascotas en su despedida.",
        features: ["Aromaterapia", "Iluminación cálida", "Sillas cómodas"],
        imagen_url: "sala1.jpg",
      },
      {
        title: "Horno Crematorio",
        body: "Equipo certificado de última generación, seguro y eficiente.",
        features: ["Certificado SEC", "Alta eficiencia térmica", "Proceso controlado"],
        imagen_url: "horno1.jpg",
      },
      {
        title: "Jardín del Recuerdo",
        body: "Un espacio exterior para reflexionar y despedirse.",
        features: ["Árboles nativos", "Bancas", "Zona de descanso"],
        imagen_url: "jardin1.jpg",
      },
    ],
  });

  console.log("✔ Instalaciones creadas");

  // =====================================================
  // 8. MEMORIAL
  // =====================================================
  await db.memorial.createMany({
    data: [
      {
        nombre: "Firulais",
        raza: "Labrador",
        fecha: new Date("2023-10-14"),
        dedicatoria: "Gracias por tantos años de felicidad.",
      },
      {
        nombre: "Michi",
        raza: "Gato Atigrado",
        fecha: new Date("2024-01-08"),
        dedicatoria: "Siempre en nuestros corazones.",
      },
      {
        nombre: "Copito",
        raza: "Conejo Enano",
        fecha: new Date("2022-07-20"),
        dedicatoria: "Tu ternura nos acompañará por siempre.",
      },
    ],
  });

  console.log("✔ Memorial creado");

  // =====================================================
  // 9. ABOUT BLOCK
  // =====================================================
  await db.aboutBlock.createMany({
    data: [
      {
        title: "Nuestra Misión",
        body: "Brindar un servicio digno, respetuoso y profesional para despedir a las mascotas que forman parte de nuestras familias.",
        items: ["Acompañamiento", "Respeto", "Profesionalismo"],
        imagen_url: "mision.jpg",
      },
      {
        title: "Nuestros Valores",
        body: "Trabajamos con transparencia, empatía y dedicación para entregar tranquilidad en momentos difíciles.",
        items: ["Transparencia", "Empatía", "Dedicación"],
        imagen_url: "valores.jpg",
      },
      {
        title: "Nuestra Historia",
        body: "Más de diez años entregando un servicio humano y comprometido con cada familia.",
        items: ["Fundado en 2013", "Cientos de familias acompañadas", "Crecimiento constante"],
        imagen_url: "historia.jpg",
      },
    ],
  });

  console.log("✔ AboutBlock creado");

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
