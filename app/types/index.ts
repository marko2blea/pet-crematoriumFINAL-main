// app/types/index.ts

// (CORRECCIÓN) El tipo User ya no debe tener 'id_mascota'
export type User = {
  id_usuario: number;
  nombre: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  correo: string | null;
  telefono: number | null;
  region: string | null;
  comuna: string | null;
  direccion: string | null;
  id_rol: number | null;
  // (Opcional) Puedes añadir esto si lo necesitas en el frontend
  // mascotas?: { id_mascota: number, nombre_mascota: string }[];
}

export type Rol = {
  id_rol: number;
  nombre_rol: string | null;
}

export type Product = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
}

export type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  quantity: number;
}