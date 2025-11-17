// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('Iniciando el Seed SIMPLE (Solo Usuarios y Productos)...');

  // ================================================================
  // 1. ROLES y ESPECIES (Para llaves foráneas)
  // ================================================================
  const rolCliente = await db.rol.upsert({ where: { id_rol: 1 }, update: {}, create: { id_rol: 1, nombre_rol: 'Cliente' } });
  const rolAdmin = await db.rol.upsert({ where: { id_rol: 2 }, update: {}, create: { id_rol: 2, nombre_rol: 'Admin' } });
  const provEjemplo = await db.proveedor.upsert({ where: { id_proveedor: 1 }, update: {}, create: { id_proveedor: 1, proveedor: 'Proveedor Ejemplo', disponible: true } });
  const especiePerro = await db.especie.upsert({ where: { id_especie: 1 }, update: {}, create: { id_especie: 1, tipo_mascota: 'Canino', nombre_especie: 'Perro', raza: 'Mestizo' } });
  console.log('Entidades base creadas.');

  // ================================================================
  // 2. USUARIOS REQUERIDOS
  // ================================================================

  // --- Usuario Admin (admin@gmail.com / admin1234) ---
  await db.usuario.upsert({
    where: { correo: 'admin@gmail.com' },
    update: {},
    create: {
      nombre: 'Admin', apellido_paterno: 'Principal', correo: 'admin@gmail.com',
      contrase_a: await bcrypt.hash('admin1234', 10), id_rol: rolAdmin.id_rol, fecha_registro: new Date(),
    },
  });

  // --- Cliente de Ejemplo (cliente@gmail.com / cliente123) ---
  await db.usuario.upsert({
    where: { correo: 'cliente@gmail.com' },
    update: {},
    create: {
      nombre: 'Cliente', apellido_paterno: 'Ejemplo', correo: 'cliente@gmail.com',
      contrase_a: await bcrypt.hash('cliente123', 10), id_rol: rolCliente.id_rol, fecha_registro: new Date(),
    },
  });
  console.log('Usuarios Admin y Cliente creados.');

  // ================================================================
  // 3. PRODUCTOS Y SERVICIOS (TODO lo que pediste)
  // ================================================================

  // --- SERVICIO 1: Cremación Tradicional ---
  await db.producto.upsert({
    where: { cod_producto: 1 }, update: {},
    create: { cod_producto: 1, nombre_producto: 'Cremación Tradicional', precio_unitario: 150000, stock_actual: 999, disponible: true, tipo_producto: 'Servicio', descripcion: 'Servicio de cremación individual digna.' },
  });

  // --- SERVICIO 2: Cremación Presencial ---
  await db.producto.upsert({
    where: { cod_producto: 2 }, update: {},
    create: { cod_producto: 2, nombre_producto: 'Cremación Presencial', precio_unitario: 200000, stock_actual: 999, disponible: true, tipo_producto: 'Servicio', descripcion: 'Permite despedida en sala privada.' },
  });

  // --- SERVICIO 3: Eutanasia ---
  await db.producto.upsert({
    where: { cod_producto: 3 }, update: {},
    create: { cod_producto: 3, nombre_producto: 'Servicio Eutanasia', precio_unitario: 50000, stock_actual: 999, disponible: true, tipo_producto: 'Servicio', descripcion: 'Servicio profesional a domicilio.' },
  });

  // --- PRODUCTO 1: Urna (Ejemplo) ---
  await db.producto.upsert({
    where: { cod_producto: 4 }, update: {},
    create: { cod_producto: 4, nombre_producto: 'Urna de Madera Estándar', precio_unitario: 45000, stock_actual: 15, disponible: true, tipo_producto: 'Urna', id_proveedor: provEjemplo.id_proveedor, descripcion: 'Urna de madera maciza simple.' },
  });

  // --- ACCESORIO 1: Collar (Ejemplo) ---
  await db.producto.upsert({
    where: { cod_producto: 5 }, update: {},
    create: { cod_producto: 5, nombre_producto: 'Collar Conmemorativo', precio_unitario: 25000, stock_actual: 30, disponible: true, tipo_producto: 'Accesorio', id_proveedor: provEjemplo.id_proveedor, descripcion: 'Collar simple para cenizas.' },
  });
  console.log('Productos de ejemplo creados.');
} // fin de main()

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    console.log('Seed simple completado.');
  });