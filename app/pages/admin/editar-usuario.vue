<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">

    <div v-if="pending" class="text-center p-10 bg-white rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold text-dark-primary-blue">
        Cargando datos del usuario...
      </h1>
      <p class="text-gray-500 mt-2">Por favor, espere un momento.</p>
    </div>

    <div v-else-if="error || !form" class="text-center p-10 bg-red-50 rounded-xl shadow-lg border border-red-300">
      <h1 class="text-3xl font-bold text-red-700">Error al Cargar el Usuario</h1>
      <p class="text-gray-600 mt-2">{{ error?.statusMessage || 'El usuario no pudo ser encontrado.' }}</p>
      <button @click="router.push('/admin/gestionar-usuario')"
        class="mt-6 px-5 py-2 bg-purple-dark text-white rounded-lg hover:bg-purple-deep transition shadow-lg">
        Volver a Gestión
      </button>
    </div>
    
    <form v-else-if="form" @submit.prevent="guardarCambios" class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Editar Usuario</h1>
            <p class="text-lg text-gray-600 mt-1">Usuario ID: {{ form.id_usuario }}</p>
            <p class="text-sm font-mono text-purple-deep">{{ form.correo }} (No editable)</p>
        </div>

        <div v-if="saveMessage" 
             :class="saveError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
             class="m-6 p-4 rounded-lg border text-sm font-medium text-center">
            {{ saveMessage }}
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

            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Información de Contacto</h3>
             <div>
                <label for="telefono" class="block text-sm font-semibold text-dark-primary-blue mb-2">Teléfono</label>
                <input v-model.number="form.telefono" type="tel" id="telefono" class="form-input" placeholder="912345678" />
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
            
            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Permisos</h3>
            <div>
                <label for="rol" class="block text-sm font-semibold text-dark-primary-blue mb-2">Rol del Usuario</label>
                <select v-model.number="form.id_rol" id="rol" class="form-input bg-white">
                    <option v-if="!roles || roles.length === 0" disabled value="">Cargando roles...</option>
                    <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                        {{ rol.nombre_rol }} (ID: {{ rol.id_rol }})
                    </option>
                </select>
            </div>

        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" @click="router.push('/admin/gestionar-usuario')" 
                    class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150">
                Cancelar
            </button>
            <button type="submit" 
                    :disabled="isSaving"
                    class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'; // (MODIFICADO) Añadido 'computed'
import { useRoute, useRouter } from 'vue-router';
import type { User, Rol } from '../../../app/types'; // (MODIFICADO) Ruta relativa

// 1. Proteger esta página
definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const router = useRouter();
const usuarioId = ref(route.query.id as string);

// (MODIFICADO) Interfaz completa (Usuario + Rol)
interface UserForm {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    correo: string;
    telefono: number | null;
    region: string | null;
    comuna: string | null;
    direccion: string | null;
    id_rol: number; // Campo de Rol
}

// (NUEVO) Interfaz para la respuesta de la API
interface DetalleUsuarioResponse {
  usuario: User;
  rolesDisponibles: Rol[];
}

// --- Estado del Formulario ---
const form = ref<UserForm | null>(null);
const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

// (ELIMINADO) La llamada a /api/roles se borra, ya que es redundante
// const { data: roles, pending: pendingRoles } = ...

// --- (MODIFICADO) Carga de Datos ---
// Ahora cargamos todo (usuario + roles) en una sola llamada
const { data: loadedData, pending, error } = await useAsyncData<DetalleUsuarioResponse>(
  'usuario-detalle',
  () => {
    if (!usuarioId.value) throw createError({ statusCode: 400, statusMessage: 'Falta ID de usuario' });
    return $fetch('../api/admin/usuario-detalle', { query: { id: usuarioId.value } })
  },
  { watch: [usuarioId] }
);

// (NUEVO) 'roles' ahora es un 'computed' que lee la data cargada
const roles = computed(() => {
  return loadedData.value?.rolesDisponibles || [];
});

// (MODIFICADO) Rellenar el formulario
watchEffect(() => {
  // Ahora leemos desde 'loadedData.value.usuario'
  if (loadedData.value && loadedData.value.usuario) {
    const usuario = loadedData.value.usuario;
    form.value = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre || '',
      apellido_paterno: usuario.apellido_paterno || '',
      apellido_materno: usuario.apellido_materno,
      correo: usuario.correo || '',
      telefono: usuario.telefono,
      region: usuario.region,
      comuna: usuario.comuna,
      direccion: usuario.direccion,
      id_rol: usuario.id_rol || 1, // Asigna 1 (Cliente) si es nulo
    };
  }
});

// --- Guardar Cambios (Sin cambios) ---
const guardarCambios = async () => {
  if (!form.value) return;

  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    await $fetch('/api/admin/editar-usuario', {
      method: 'PUT',
      body: form.value 
    });

    saveMessage.value = '¡Usuario actualizado con éxito! Redirigiendo...';
    saveError.value = false;
    
    setTimeout(() => {
      router.push('/admin/gestionar-usuario');
    }, 2000);

  } catch (err: any) {
    isSaving.value = false;
    saveError.value = true;
    saveMessage.value = err.data?.statusMessage || 'Error al guardar el usuario.';
  }
};
</script>

<style scoped lang="postcss">
/* (Estilos sin cambios) */
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
.bg-red-50 { background-color: #fef2f2; }

/* (NUEVO) Clase reutilizable para inputs */
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
</style>