<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    
    <form @submit.prevent="handleSubmit" class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Añadir Nuevo Usuario</h1>
            <p class="text-lg text-gray-600 mt-1">Crear una cuenta (Cliente o Admin) manualmente.</p>
        </div>

        <div v-if="message" 
             :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
             class="m-6 p-4 rounded-lg border text-sm font-medium text-center">
            {{ message }}
        </div>

        <div class="p-6 md:p-8 space-y-6">

            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2">Información Personal</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label for="nombre" class="block text-sm font-semibold text-dark-primary-blue mb-2">Nombre</label>
                    <input v-model="form.nombre" type="text" id="nombre" class="form-input" required />
                </div>
                <div>
                    <label for="apellido_paterno" class="block text-sm font-semibold text-dark-primary-blue mb-2">Apellido Paterno</label>
                    <input v-model="form.apellido_paterno" type="text" id="apellido_paterno" class="form-input" required />
                </div>
                <div>
                    <label for="apellido_materno" class="block text-sm font-semibold text-dark-primary-blue mb-2">Apellido Materno</label>
                    <input v-model="form.apellido_materno" type="text" id="apellido_materno" class="form-input" />
                </div>
            </div>

            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Información de Acceso y Rol</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="email" class="block text-sm font-semibold text-dark-primary-blue mb-2">Correo Electrónico</label>
                    <input v-model="form.correo" type="email" id="email" class="form-input" required />
                </div>
                <div>
                    <label for="password" class="block text-sm font-semibold text-dark-primary-blue mb-2">Contraseña</label>
                    <input v-model="form.password" type="password" id="password" class="form-input" required />
                </div>
            </div>
            <div>
                <label for="rol" class="block text-sm font-semibold text-dark-primary-blue mb-2">Rol del Usuario</label>
                <select v-model.number="form.id_rol" id="rol" class="form-input bg-white">
                    <option v-if="pendingRoles || !roles" disabled value="">Cargando roles...</option>
                    <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                        {{ rol.nombre_rol }} (ID: {{ rol.id_rol }})
                    </option>
                </select>
            </div>

            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Información de Contacto (Opcional)</h3>
             <div>
                <label for="telefono" class="block text-sm font-semibold text-dark-primary-blue mb-2">Teléfono</label>
                <input v-model="form.telefono" type="tel" id="telefono" class="form-input" placeholder="912345678" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="region" class="block text-sm font-semibold text-dark-primary-blue mb-2">Región</label>
                    <input v-model="form.region" type="text" id="region" class="form-input" />
                </div>
                <div>
                    <label for="comuna" class="block text-sm font-semibold text-dark-primary-blue mb-2">Comuna</label>
                    <input v-model="form.comuna" type="text" id="comuna" class="form-input" />
                </div>
            </div>
             <div>
                <label for="direccion" class="block text-sm font-semibold text-dark-primary-blue mb-2">Dirección</label>
                <input v-model="form.direccion" type="text" id="direccion" class="form-input" />
            </div>
            
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" @click="router.push('/admin/gestionar-usuario')" 
                    class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150">
                Cancelar
            </button>
            <button type="submit" 
                    :disabled="isLoading"
                    class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isLoading ? 'Creando...' : 'Crear Usuario' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Rol } from '../../../app/types';

definePageMeta({
  middleware: 'auth'
});

const router = useRouter();

// (MODIFICADO) Formulario completo
const form = ref({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
    password: '',
    id_rol: 1, // Por defecto 'Cliente'
    telefono: null as number | null,
    region: '',
    comuna: '',
    direccion: ''
});

const message = ref('');
const isError = ref(false);
const isLoading = ref(false);

// Cargar roles para el dropdown
const { data: roles, pending: pendingRoles } = await useAsyncData<Rol[]>(
  'lista-roles',
  () => $fetch('../../../api/roles') //
);

// (MODIFICADO) Lógica de envío
const handleSubmit = async () => {
    isLoading.value = true;
    message.value = '';
    isError.value = false;

    try {
        await $fetch('/api/admin/agregar-usuario', {
            method: 'POST',
            body: form.value // Enviamos el objeto 'form' completo
        });

        message.value = '¡Usuario creado con éxito! Redirigiendo...';
        isError.value = false;
        
        setTimeout(() => {
            router.push('/admin/gestionar-usuario');
        }, 2000);

    } catch (err: any) {
        isLoading.value = false;
        isError.value = true;
        message.value = err.data?.statusMessage || 'Error al crear el usuario.';
    }
};
</script>

<style scoped lang="postcss">
/* (Estilos copiados de editar-usuario.vue) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.border-green-300 { border-color: #c3e6cb; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-700 { color: #721c24; }
.border-red-300 { border-color: #f5c6cb; }

/* Clase reutilizable para inputs */
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
</style>