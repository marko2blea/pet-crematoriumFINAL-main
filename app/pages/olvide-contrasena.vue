<template>
  <div class="flex items-center justify-center bg-gray-100 pt-14">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-purple-deep">
      
      <div class="text-center mb-6">
          <h1 class="text-3xl font-extrabold text-purple-dark">Resetear Contraseña</h1>
          <p class="text-gray-600 mt-2">Ingresa tu correo y te enviaremos un enlace para resetear tu contraseña.</p>
      </div>

      <form @submit.prevent="handleRequest" class="space-y-4" v-if="!messageSent">
        <div>
          <label for="email" class="block text-sm font-semibold text-dark-primary-blue mb-2">Correo Electrónico</label>
          <input 
            type="email" 
            v-model="email" 
            id="email" 
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep" 
            placeholder="tu@correo.com"
            required 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-purple-deep text-white py-3 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar Enlace' }}
        </button>
      </form>

      <div v-if="feedbackMessage" :class="isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" class="mt-4 text-center p-3 rounded-lg">
        {{ feedbackMessage }}
      </div>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          ¿Recordaste tu contraseña? 
          <NuxtLink to="/login" class="font-bold text-purple-deep hover:underline">Volver al Login</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const feedbackMessage = ref('');
const isError = ref(false);
const isLoading = ref(false);
const messageSent = ref(false);

const handleRequest = async () => {
    isLoading.value = true;
    isError.value = false;
    feedbackMessage.value = '';

    try {
        await $fetch('/api/auth/solicitar-reseteo', {
            method: 'POST',
            body: { email: email.value }
        });
        
        messageSent.value = true;
        isError.value = false;
        feedbackMessage.value = '¡Enlace enviado! Revisa tu correo (y tu carpeta de spam) para continuar.';

    } catch (err: any) {
        isLoading.value = false;
        isError.value = true;
        feedbackMessage.value = err.data?.statusMessage || 'Error al procesar la solicitud.';
    }
};
</script>

<style scoped>
/* (Estilos idénticos a login.vue) */
.text-purple-dark { color: #4A235A; }
.text-purple-deep { color: #5C2A72; }
.border-purple-deep { border-color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-700 { color: #721c24; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
</style>