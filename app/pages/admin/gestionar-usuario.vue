<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    
    <div class="flex justify-between items-center mb-8 border-b-2 border-gray-300 pb-3">
        <h1 class="text-3xl font-bold text-purple-dark">Gestión de Usuarios</h1>
        
        <div class="flex space-x-3 items-center">
             <!-- (ACTUALIZADO) Este botón ahora funciona -->
             <button @click="goToAddUser" class="bg-purple-deep text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md">
                Añadir Nuevo Usuario (Manual)
            </button>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
        
        <!-- Indicador de carga -->
        <div v-if="pending" class="text-center py-10 text-gray-500">
            Cargando usuarios...
        </div>

        <!-- Indicador de error -->
        <div v-else-if="error" class="text-center py-10 text-red-600 bg-red-50">
            Error al cargar los usuarios: {{ error.message }}
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-purple-dark text-white">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                    <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Rol</th>
                    <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha de Registro</th>
                    <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                
                <!-- El v-for ahora usa 'usuarios' (los datos de la API) -->
                <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-purple-card transition duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-primary-blue">{{ usuario.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <p class="text-sm font-semibold text-purple-dark">{{ usuario.nombre }}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {{ usuario.email }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="font-semibold"
                              :class="usuario.rol === 'Admin' ? 'text-purple-deep' : 'text-gray-600'">
                            {{ usuario.rol }}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ usuario.fechaRegistro }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        
                        <!-- (CORREGIDO) Botón de editar ahora llama a la función -->
                        <button 
                                @click="editUserRole(usuario)"
                                class="text-purple-deep hover:text-purple-light p-1 rounded-full transition duration-150" 
                                title="Editar Rol de Usuario">
                            <font-awesome-icon icon="fas fa-user-shield" />
                        </button>

                        <button 
                                class="text-red-600 hover:text-red-800 p-1 rounded-full transition duration-150 ml-2" 
                                title="Eliminar Usuario">
                            <font-awesome-icon icon="fas fa-trash-alt" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Mensaje si no hay resultados -->
        <div v-if="!pending && usuarios && usuarios.length === 0" class="text-center py-10 text-gray-500">
            No se encontraron usuarios registrados.
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
});

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // (CORRECCIÓN) Importar router
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserShield, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; 

// 1. Proteger esta página


library.add(faUserShield, faTrashAlt);
const router = useRouter(); // (CORRECCIÓN) Inicializar router

// --- Carga de Datos ---

// Tipado para la data (coincide con el formato de la API)
interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    fechaRegistro: string;
}

// 2. Llamada a la API
const { 
  data: usuarios, 
  pending, 
  error, 
} = await useAsyncData<Usuario[]>(
  'lista-usuarios',
  () => $fetch('/api/admin/usuarios'),
  {
    default: () => [] // Valor por defecto mientras carga
  }
);

// --- (CORRECCIÓN) Funciones de Acción ---

// (NUEVO) Función para el botón "Añadir"
const goToAddUser = () => {
    router.push('/admin/agregar-usuario');
};

const editUserRole = (usuario: Usuario) => {
    // (Esta ya estaba bien)
    router.push(`/admin/editar-usuario?id=${usuario.id}`);
};

</script>

<style scoped>
/* Estilos (Copiados de inventario.vue) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
th {
    background-color: #4A235A;
}
.hover\:bg-purple-card:hover {
    background-color: #fcfaff;
}
.text-red-600 { color: #dc3545; }
.hover\:text-red-800:hover { color: #a71d2a; }
.bg-red-50 { background-color: #fef2f2; }
</style>