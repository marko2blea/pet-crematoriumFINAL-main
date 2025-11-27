// prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// URLs de imágenes externas proporcionadas por el usuario
const IMAGE_URLS = {
    // ------------------- PRODUCTOS Y SERVICIOS -------------------
    CREMACION_PRESENCIAL: 'https://www.expomedhub.com/img/blog/veterinario-vet.jpg',
    CREMACION_TRADICIONAL: 'https://papelmatic.com/wp-content/uploads/2025/08/papelmatic-higiene-profesional-limpieza-desinfeccion-clinicas-veterinarias.jpg',
    EUTANASIA: 'https://www.bupasalud.com/sites/default/files/styles/640_x_400/public/articulos/2024-09/fotos/beneficios%20de%20tener%20una%20mascota-1.jpg?itok=HfGQPxj2',
    COLLAR_RECUERDO: 'https://www.michy.cl/cdn/shop/files/la-michy-tienda-acero-inoxidable-collar-patitas-dorado-collar-proyeccion-patita-de-recuerdos-41033194504439.webp?v=1701032160&width=800',
    LLAVERO_CENIZAS: 'https://elcofredelosrecuerdos.com/wp-content/uploads/2025/05/Diseno-sin-titulo-2025-05-15T123748.564.webp',
    URNA_MARMOL_PREMIUM: 'https://funeza.com/funeza-old/wp-content/uploads/2021/04/18-400x400.jpeg',
    URNA_MARMOL_NATURAL: 'https://cdn.webshopapp.com/shops/252862/files/241955225/750x750x2/su-6783-urna-de-marmol.jpg',
    
    // ------------------- RUTAS RELATIVAS (MANTENIDAS) -------------------
    INSTALACION_1: 'https://cremaguada.com/wp-content/uploads/2023/11/cremaguada5.jpg',
    INSTALACION_2: 'https://tanatosformacion.com/wp-content/uploads/2021/07/horno-crematorio-scaled.jpg',
    INSTALACION_3: 'https://revistasantiago.cl/cms/wp-content/uploads/2024/02/CEMENTERIO-ANIMALES-PUNTA-ARENAS-PRENSA-AUSTRAL-1.jpg',
    MISION: 'https://arcadenoe.com.gt/cdn/shop/articles/unnamed_3001a694-99b3-4997-be50-40db2a16aedc_1980x.jpg?v=1590523057',
    VALORES: 'https://www.webconsultas.com/sites/default/files/styles/wch_image_schema/public/media/0d/temas/elegir_buen_veterinario_p.jpg',
    HISTORIA: 'https://www.hola.com/horizon/landscape/889bb47c9ca6-comportamiento-mascota-familiar-t.jpg',
};


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

  await db.usuario.upsert({
    where: { correo: "admin@gmail.com" },
    update: { contrase_a: adminPassword, id_rol: rolAdmin.id_rol },
    create: {
      nombre: "Admin",
      apellido_paterno: "Principal",
      correo: "admin@gmail.com",
      contrase_a: adminPassword,
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });

  await db.usuario.upsert({
    where: { correo: "marco.araneda1@virginiogomez.cl" },
    update: { contrase_a: userPassword1, id_rol: rolCliente.id_rol },
    create: {
      nombre: "Marco",
      apellido_paterno: "Araneda",
      correo: "marco.araneda1@virginiogomez.cl",
      contrase_a: userPassword1,
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });

  await db.usuario.upsert({
    where: { correo: "francisca.gatica2@virginiogomez.cl" },
    update: { contrase_a: userPassword2, id_rol: rolCliente.id_rol },
    create: {
      nombre: "Francisca",
      apellido_paterno: "Gatica",
      correo: "francisca.gatica2@virginiogomez.cl",
      contrase_a: userPassword2,
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });

  await db.usuario.upsert({
    where: { correo: "nicolas.quinchavil@virginiogomez.cl" },
    update: { contrase_a: userPassword3, id_rol: rolCliente.id_rol },
    create: {
      nombre: "Nicolas",
      apellido_paterno: "Quinchavil",
      correo: "nicolas.quinchavil@virginiogomez.cl",
      contrase_a: userPassword3,
      id_rol: rolAdmin.id_rol,
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
  // 4. PRODUCTOS (Servicios, Urnas y Accesorios) - IMÁGENES CON URL EXTERNA
  // =====================================================

  // --- 4.1 SERVICIOS BASE ---
  await db.producto.upsert({
    where: { cod_producto: 4 },
    update: { imagen_url: IMAGE_URLS.CREMACION_TRADICIONAL },
    create: {
      cod_producto: 4,
      nombre_producto: "Cremación Tradicional",
      precio_unitario: new Prisma.Decimal(165000), 
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "Servicio de cremación con entrega de cenizas en urna sencilla y certificado.",
      imagen_url: IMAGE_URLS.CREMACION_TRADICIONAL,
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 7 },
    update: { imagen_url: IMAGE_URLS.CREMACION_PRESENCIAL },
    create: {
      cod_producto: 7,
      nombre_producto: "Cremación Presencial",
      precio_unitario: new Prisma.Decimal(250000),
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "OPCIÓN PARA PRESENCIAR EL PROCESO EN NUESTRA SALA DE DESPEDIDA",
      imagen_url: IMAGE_URLS.CREMACION_PRESENCIAL,
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 8 },
    update: { imagen_url: IMAGE_URLS.EUTANASIA },
    create: {
      cod_producto: 8,
      nombre_producto: "Servicio Eutanasia",
      precio_unitario: new Prisma.Decimal(75000),
      stock_actual: 999,
      tipo_producto: "Servicio",
      disponible: true,
      descripcion: "REALIZADO POR PERSONAL MÉDICO VETERINARIO CALIFICADO",
      imagen_url: IMAGE_URLS.EUTANASIA,
    },
  });
  
  // --- 4.2 URNAS ---
  await db.producto.upsert({
    where: { cod_producto: 2 },
    update: { imagen_url: IMAGE_URLS.URNA_MARMOL_NATURAL, nombre_producto: "Urna de Mármol Natural" },
    create: {
      cod_producto: 2,
      nombre_producto: "Urna de Mármol Natural",
      precio_unitario: new Prisma.Decimal(40000),
      stock_actual: 20,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna de mármol con acabado natural, diseño sobrio y elegante.",
      imagen_url: IMAGE_URLS.URNA_MARMOL_NATURAL, // URL Externa
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 5 },
    update: { imagen_url: IMAGE_URLS.URNA_MARMOL_PREMIUM },
    create: {
      cod_producto: 5,
      nombre_producto: "Urna de Mármol Premium",
      precio_unitario: new Prisma.Decimal(80000),
      stock_actual: 15,
      tipo_producto: "Urna",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Urna de mármol pulido, elegante y duradera.",
      imagen_url: IMAGE_URLS.URNA_MARMOL_PREMIUM, // URL Externa
    },
  });

  // --- 4.3 ACCESORIOS ---
  await db.producto.upsert({
    where: { cod_producto: 3 },
    update: { imagen_url: IMAGE_URLS.COLLAR_RECUERDO },
    create: {
      cod_producto: 3,
      nombre_producto: "Collar Recuerdo",
      precio_unitario: new Prisma.Decimal(25000),
      stock_actual: 40,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Collar para almacenar parte de las cenizas.",
      imagen_url: IMAGE_URLS.COLLAR_RECUERDO, // URL Externa
    },
  });

  await db.producto.upsert({
    where: { cod_producto: 6 },
    update: { imagen_url: IMAGE_URLS.LLAVERO_CENIZAS },
    create: {
      cod_producto: 6,
      nombre_producto: "Llavero Cenizas Huella",
      precio_unitario: new Prisma.Decimal(35000),
      stock_actual: 30,
      tipo_producto: "Accesorio",
      id_proveedor: proveedor.id_proveedor,
      disponible: true,
      descripcion: "Llavero con forma de huella para llevar un recuerdo de tu mascota.",
      imagen_url: IMAGE_URLS.LLAVERO_CENIZAS, // URL Externa
    },
  });

  console.log("✔ Productos y Servicios creados");

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
    create: { id_especie: 3, nombre_especie: "Conejo" },
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
  // 7. INSTALACIONES - RUTAS RELATIVAS MANTENIDAS
  // =====================================================
  await db.instalacion.deleteMany({});
  await db.instalacion.createMany({
    data: [
      {
        title: "Sala de Despedida",
        body: "Un espacio tranquilo para acompañar a tus mascotas en su despedida.",
        features: ["Aromaterapia", "Iluminación cálida", "Sillas cómodas"],
        imagen_url: IMAGE_URLS.INSTALACION_1,
      },
      {
        title: "Horno Crematorio",
        body: "Equipo certificado de última generación, seguro y eficiente.",
        features: ["Certificado SEC", "Alta eficiencia térmica", "Proceso controlado"],
        imagen_url: IMAGE_URLS.INSTALACION_2,
      },
      {
        title: "Jardín del Recuerdo",
        body: "Un espacio exterior para reflexionar y despedirse.",
        features: ["Árboles nativos", "Bancas", "Zona de descanso"],
        imagen_url: IMAGE_URLS.INSTALACION_3,
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
  // 9. ABOUT BLOCK - RUTAS RELATIVAS MANTENIDAS
  // =====================================================
  await db.aboutBlock.deleteMany({});
  await db.aboutBlock.createMany({
    data: [
      {
        title: "Nuestra Misión",
        body: "Brindar un servicio digno, respetuoso y profesional para despedir a las mascotas que forman parte de nuestras familias.",
        items: ["Acompañamiento", "Respeto", "Profesionalismo"],
        imagen_url: IMAGE_URLS.MISION,
      },
      {
        title: "Nuestros Valores",
        body: "Trabajamos con transparencia, empatía y dedicación para entregar tranquilidad en momentos difíciles.",
        items: ["Transparencia", "Empatía", "Dedicación"],
        imagen_url: IMAGE_URLS.VALORES,
      },
      {
        title: "Nuestra Historia",
        body: "Más de diez años entregando un servicio humano y comprometido con cada familia.",
        items: ["Fundado en 2025", "Cientos de familias acompañadas", "Crecimiento constante"],
        imagen_url: IMAGE_URLS.HISTORIA,
      },
    ],
  });

  console.log("✔ AboutBlock creado");

  // =====================================================
  // 10. RESERVA / PEDIDO DE EJEMPLO
  // =====================================================
  console.log("Se omitió la creación de la Reserva/Pedido de ejemplo.");

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

