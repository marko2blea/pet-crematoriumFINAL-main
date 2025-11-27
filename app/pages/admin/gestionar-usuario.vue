<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4 animate-page-fade">
    
    <div
      class="flex justify-between items-center mb-8 border-b-2 border-gray-300 pb-3 animate-fade-in-up"
    >
      <h1 class="text-3xl font-bold text-purple-dark flex items-center gap-2">
        <span class="inline-block h-3 w-3 rounded-full bg-green-400 animate-pulse-soft"></span>
        Gestión de Usuarios
      </h1>
      
      <div class="flex space-x-3 items-center">
        <!-- Botón añadir usuario -->
        <button
          @click="goToAddUser"
          class="bg-purple-deep text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          Añadir Nuevo Usuario (Manual)
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
      
      <!-- Indicador de carga -->
      <div v-if="pending" class="text-center py-10 text-gray-500 animate-fade-in-up">
        <div class="flex flex-col items-center gap-2">
          <span class="inline-block animate-spin-slow text-purple-deep text-2xl">⏳</span>
          <p class="text-lg font-semibold">Cargando usuarios...</p>
        </div>
      </div>

      <!-- Indicador de error -->
      <div
        v-else-if="error"
        class="text-center py-10 text-red-600 bg-red-50 animate-fade-in-up"
      >
        Error al cargar los usuarios: {{ error.message }}
      </div>
      
      <table
        v-else
        class="min-w-full divide-y divide-gray-200"
      >
        <thead class="bg-purple-dark text-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Rol
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Fecha de Registro
            </th>
            <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          
          <!-- Filas de usuarios -->
          <tr
            v-for="(usuario, index) in usuarios"
            :key="usuario.id"
            class="hover:bg-purple-card transition duration-150 transform hover:-translate-y-0.5"
            :class="'animate-row-fade-' + (index % 3)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-primary-blue">
              {{ usuario.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <p class="text-sm font-semibold text-purple-dark">
                {{ usuario.nombre }}
              </p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ usuario.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="font-semibold px-2 py-0.5 rounded-full text-xs"
                :class="usuario.rol === 'Admin'
                  ? 'text-purple-deep bg-purple-100'
                  : 'text-gray-600 bg-gray-100'"
              >
                {{ usuario.rol }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ usuario.fechaRegistro }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <!-- Editar -->
              <button
                @click="editUserRole(usuario)"
                class="text-purple-deep hover:text-purple-light p-1 rounded-full transition duration-150 transform hover:-translate-y-0.5"
                title="Editar Rol de Usuario"
              >
                <font-awesome-icon icon="fas fa-user-shield" />
              </button>

              <!-- Eliminar (solo UI, sin lógica extra) -->
              <button
                class="text-red-600 hover:text-red-800 p-1 rounded-full transition duration-150 ml-2 transform hover:-translate-y-0.5"
                title="Eliminar Usuario"
              >
                <font-awesome-icon icon="fas fa-trash-alt" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mensaje si no hay resultados -->
      <div
        v-if="!pending && usuarios && usuarios.length === 0"
        class="text-center py-10 text-gray-500 animate-fade-in-up"
      >
        No se encontraron usuarios registrados.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserShield, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

library.add(faUserShield, faTrashAlt);

const router = useRouter();

// Tipado para la data (coincide con el formato de la API)
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaRegistro: string;
}

// Llamada a la API
const {
  data: usuarios,
  pending,
  error
} = await useAsyncData<Usuario[]>(
  'lista-usuarios',
  () => $fetch('/api/admin/usuarios'),
  {
    default: () => []
  }
);

// Función para el botón "Añadir"
const goToAddUser = () => {
  router.push('/admin/agregar-usuario');
};

const editUserRole = (usuario: Usuario) => {
  router.push(`/admin/editar-usuario?id=${usuario.id}`);
};
</script>

<style scoped lang="postcss">
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
th { background-color: #4A235A; }
.hover\:bg-purple-card:hover { background-color: #fcfaff; }
.text-red-600 { color: #dc3545; }
.hover\:text-red-800:hover { color: #a71d2a; }
.bg-red-50 { background-color: #fef2f2; }

.bg-purple-100 { background-color: #f3e8ff; }
.bg-gray-100 { background-color: #f3f4f6; }

/* Animaciones generales */
@keyframes page-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes row-fade {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.12); }
}

/* Helpers de animación */
.animate-page-fade {
  animation: page-fade 0.25s ease-out;
}
.animate-fade-in-up {
  animation: fade-in-up 0.35s ease-out;
}
.animate-scale-in {
  animation: scale-in 0.35s ease-out;
}
.animate-spin-slow {
  animation: spin-slow 1s linear infinite;
}
.animate-pulse-soft {
  animation: pulse-soft 1.2s ease-in-out infinite;
}

/* Variantes pequeñas para filas (ligero stagger) */
.animate-row-fade-0 {
  animation: row-fade 0.25s ease-out;
}
.animate-row-fade-1 {
  animation: row-fade 0.3s ease-out;
}
.animate-row-fade-2 {
  animation: row-fade 0.35s ease-out;
}
</style>
