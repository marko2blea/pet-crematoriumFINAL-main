// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

function roundCLP(value: number): number {
  return Math.round(value);
}

async function main() {
  console.log('Iniciando el seed simple...');

  // --- 1. Roles ---
  // Accede a 'model Rol' usando db.rol
  const rolCliente = await db.rol.upsert({
    where: { id_rol: 1 },
    update: {},
    create: { id_rol: 1, nombre_rol: 'Cliente' },
  });

  const rolAdmin = await db.rol.upsert({
    where: { id_rol: 2 },
    update: {},
    create: { id_rol: 2, nombre_rol: 'Admin' },
  });
  console.log('Roles creados.');

  // --- 2. Usuario Admin ---
  // Accede a 'model Usuario' usando db.usuario
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin1234';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await db.usuario.upsert({
    where: { correo: adminEmail },
    update: { id_rol: rolAdmin.id_rol },
    create: {
      nombre: 'Admin',
      apellido_paterno: 'Principal',
      correo: adminEmail,
      contrase_a: hashedPassword,
      id_rol: rolAdmin.id_rol,
      fecha_registro: new Date(),
    },
  });
  console.log('Usuario Admin creado.');

  // --- 3. Cliente de Ejemplo ---
  // Accede a 'model Usuario' usando db.usuario
  const clienteEmail = 'cliente@gmail.com';
  await db.usuario.upsert({
    where: { correo: clienteEmail },
    update: {},
    create: {
      nombre: 'Cliente',
      apellido_paterno: 'Ejemplo',
      correo: clienteEmail,
      contrase_a: await bcrypt.hash('cliente123', 10),
      id_rol: rolCliente.id_rol,
      fecha_registro: new Date(),
    },
  });
  console.log('Cliente de Ejemplo creado.');
  
  // --- 4. Proveedor (necesario para productos) ---
  const provEjemplo = await db.proveedor.upsert({
    where: { id_proveedor: 1 },
    update: { proveedor: 'Proveedor Ejemplo' },
    create: { id_proveedor: 1, proveedor: 'Proveedor Ejemplo', disponible: true },
  });
  console.log('Proveedor creado.');

  // --- 5. Productos (1 de cada) ---

  // 1. Servicio
  await db.producto.upsert({
    where: { cod_producto: 1 }, update: {},
    create: {
      cod_producto: 1, nombre_producto: 'Cremacion Simple', precio_unitario: 150000, stock_actual: 999, disponible: true, tipo_producto: 'Servicio', descripcion: 'Servicio de cremacion simple.',
    },
  });

  // 2. Producto (Urna)
  await db.producto.upsert({
    where: { cod_producto: 2 }, update: {},
    create: {
      cod_producto: 2, nombre_producto: 'Urna Basica', precio_unitario: 45000, stock_actual: 15, disponible: true, tipo_producto: 'Urna', id_proveedor: provEjemplo.id_proveedor, descripcion: 'Urna basica de madera.',
    },
  });

  // 3. Accesorio
  await db.producto.upsert({
    where: { cod_producto: 3 }, update: {},
    create: {
      cod_producto: 3, nombre_producto: 'Collar Simple', precio_unitario: 25000, stock_actual: 30, disponible: true, tipo_producto: 'Accesorio', id_proveedor: provEjemplo.id_proveedor, descripcion: 'Collar simple para cenizas.',
    },
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