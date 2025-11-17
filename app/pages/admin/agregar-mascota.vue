<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl pt-20">
    
    <h1 class="text-4xl font-bold mb-8 text-purple-dark">Añadir Memorial</h1>
    <p class="text-gray-600 mb-6">Registre los datos de la mascota para aparecer en el Memorial.</p>

    <button @click="router.push('/memorial')" class="text-purple-light hover:text-purple-dark transition duration-150 mb-6 flex items-center">
      <font-awesome-icon icon="fas fa-arrow-left" class="mr-2" /> Volver al Memorial
    </button>


    <div class="bg-white-subtle p-8 rounded-xl shadow-2xl max-w-xl mx-auto border-t-4 border-purple-deep">
      <h2 class="text-2xl font-semibold mb-6 text-purple-dark border-b pb-2">Registro Conmemorativo</h2>

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
                class="w-full bg-purple-deep text-white py-3 rounded-lg font-semibold hover:bg-purple-light transition duration-150 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed">
          <font-awesome-icon icon="fas fa-plus" class="mr-2" /> 
          {{ isLoading ? 'Añadiendo...' : 'Añadir al Memorial' }}
        </button>
      </form>

      <p v-if="message" :class="messageClass" class="mt-4 p-3 rounded-lg text-sm text-center">{{ message }}</p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 

library.add(faPlus, faArrowLeft);

// (CORRECCIÓN)
// Cambiado de 'auth' a 'admin'
definePageMeta({
  middleware: 'admin' 
});

const router = useRouter();

// Estado del formulario
const form = ref({
  nombre: '',
  raza: '',
  fecha: new Date().toISOString().slice(0, 10), // Fecha actual por defecto
  dedicatoria: ''
});

const message = ref('');
const messageClass = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  message.value = '';

  try {
    await $fetch('../api/admin/agregar-memorial', {
      method: 'POST',
      body: form.value
    });
    
    message.value = `¡Memorial de "${form.value.nombre}" añadido con éxito! Redirigiendo...`;
    messageClass.value = 'bg-green-100 text-green-800'; 

    setTimeout(() => {
        router.push('/memorial');
    }, 2000);

  } catch (err: any) {
    isLoading.value = false;
    message.value = err.data?.statusMessage || 'Error al añadir el memorial.';
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
.bg-red-100 { background-color: #fef2f2; }
.text-red-800 { color: #991b1b; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
</style>