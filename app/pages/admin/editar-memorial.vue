<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl pt-20">
    
    <div class="flex justify-between items-center mb-8 border-b-2 border-gray-300 pb-3">
        <h1 class="text-4xl font-bold text-purple-dark">
            Editando Memorial: {{ form ? form.nombre : 'Cargando...' }}
        </h1>
    </div>

    <button @click="router.push('/memorial')" class="text-purple-light hover:text-purple-dark transition duration-150 mb-6 flex items-center">
      <font-awesome-icon icon="fas fa-arrow-left" class="mr-2" /> Volver al Memorial
    </button>
    
    <div v-if="pending" class="text-center p-10 bg-white-subtle shadow-lg">
        <p class="text-lg font-semibold text-purple-dark">Cargando datos del memorial...</p>
    </div>

    <div v-else-if="error" class="text-center p-10 bg-red-100 shadow-lg rounded-lg border border-red-300">
        <p class="text-lg font-semibold text-red-700">{{ error?.statusMessage || 'No se pudo cargar el registro.' }}</p>
    </div>

    <div v-else-if="form" class="bg-white-subtle p-8 rounded-xl shadow-2xl max-w-xl mx-auto border-t-4 border-purple-deep">
      <h2 class="text-2xl font-semibold mb-6 text-purple-dark border-b pb-2">Modificar Registro</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div>
          <label for="nombre" class="block text-sm font-medium text-purple-dark mb-1">Nombre:</label>
          <input type="text" v-model="form.nombre" id="nombre" required
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep">
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="raza" class="block text-sm font-medium text-purple-dark mb-1">Raza:</label>
                <input type="text" v-model="form.raza" id="raza"
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep">
            </div>
            <div>
                <label for="fecha" class="block text-sm font-medium text-purple-dark mb-1">Fecha de Fallecimiento:</label>
                <input type="date" v-model="form.fecha" id="fecha" required
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep">
            </div>
        </div>
        
        <div>
          <label for="dedicatoria" class="block text-sm font-medium text-purple-dark mb-1">Dedicatoria (Máx. 255 caracteres):</label>
          <textarea v-model="form.dedicatoria" id="dedicatoria" rows="3" maxlength="255"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep"></textarea>
        </div>
        
        <button type="submit"
                :disabled="isLoading"
                class="w-full bg-purple-deep text-white py-3 rounded-lg font-semibold hover:bg-purple-light transition duration-150 shadow-md mt-6
                       disabled:opacity-50 disabled:cursor-not-allowed">
          <font-awesome-icon icon="fas fa-save" class="mr-2" /> 
          {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </form>

      <p v-if="message" :class="messageClass" class="mt-4 p-3 rounded-lg text-sm text-center">{{ message }}</p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'; // (CORRECCIÓN 2) Importar ref
import { useRouter, useRoute } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 

library.add(faSave, faArrowLeft);
definePageMeta({
  middleware: 'auth'
});

const router = useRouter();
const route = useRoute();

// Tipado del formulario
interface MemorialForm {
  id_memorial: number;
  nombre: string;
  raza: string | null;
  fecha: string; // La API la formateará como YYYY-MM-DD
  dedicatoria: string | null;
}

// --- Estado ---
const form = ref<MemorialForm | null>(null);
const message = ref('');
const messageClass = ref('');
const isLoading = ref(false);

// --- Carga de Datos ---
// (CORRECCIÓN 2) Convertido 'memorialId' en un 'ref'
const memorialId = ref(route.query.id as string);

const { data: loadedData, pending, error } = await useAsyncData<MemorialForm>(
  'memorial-detalle',
  () => {
    // (CORRECCIÓN 2) Usar .value
    if (!memorialId.value) throw createError({ statusCode: 400, statusMessage: 'Falta ID de memorial' });
    
    return $fetch('/api/admin/memorial-detalle', { query: { id: memorialId.value } })
  },
  { 
    // (CORRECCIÓN 2) Ahora 'watch' recibe un 'ref' y funciona
    watch: [memorialId] 
  }
);

// Rellenar el formulario
watchEffect(() => {
  if (loadedData.value) {
    // (CORRECCIÓN 3) Asignación manual en lugar de structuredClone
    form.value = {
      id_memorial: loadedData.value.id_memorial,
      nombre: loadedData.value.nombre,
      raza: loadedData.value.raza,
      fecha: loadedData.value.fecha,
      dedicatoria: loadedData.value.dedicatoria,
    };
  }
});


// Envío del formulario (PUT)
const handleSubmit = async () => {
  if (!form.value) return;

  isLoading.value = true;
  message.value = '';

  try {
    await $fetch('/api/admin/editar-memorial', {
      method: 'PUT',
      body: form.value 
    });
    
    message.value = `✅ ¡Memorial de ${form.value.nombre} actualizado con éxito! Redirigiendo...`;
    messageClass.value = 'bg-green-100 text-green-800'; 

    setTimeout(() => {
        router.push('/memorial');
    }, 2000);
  
  } catch (err: any) {
    isLoading.value = false;
    message.value = `❌ ${err.data?.statusMessage || 'Error al actualizar.'}`;
    messageClass.value = 'bg-red-100 text-red-800';
  }
};
</script>

<style scoped>
/* (Estilos sin cambios) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.text-purple-light { color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; }
.border-purple-deep { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.bg-white-subtle { background-color: #F8F4FA; }
.bg-green-100 { background-color: #D1FAE5; }
.text-green-800 { color: #065F46; }
.text-red-700 { color: #b91c1c; }
.bg-red-100 { background-color: #fef2f2; }
.border-red-300 { border-color: #fca5a5; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
</style>