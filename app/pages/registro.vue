<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 pt-20 pb-10">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border-t-8 border-purple-deep">
      
      <div class="text-center mb-6">
          <img src="/logo2.png" alt="Logo Crematorio" class="w-32 mx-auto mb-4">
          <h1 class="text-3xl font-extrabold text-purple-dark">Crear una Cuenta</h1>
          <p class="text-gray-600 mt-2">Completa tus datos para registrarte.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        
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

        <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Información de Acceso</h3>
        <div>
            <label for="email" class="block text-sm font-semibold text-dark-primary-blue mb-2">Correo Electrónico</label>
            <input v-model="form.correo" type="email" id="email" class="form-input" placeholder="tu@correo.com" required />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label for="password" class="block text-sm font-semibold text-dark-primary-blue mb-2">Contraseña</label>
                <input v-model="form.password" type="password" id="password" class="form-input" placeholder="••••••••" required />
            </div>
            <div>
                <label for="confirmPassword" class="block text-sm font-semibold text-dark-primary-blue mb-2">Confirmar Contraseña</label>
                <input v-model="form.confirmPassword" type="password" id="confirmPassword" class="form-input" placeholder="••••••••" required />
            </div>
        </div>

        <h3 class="text-xl font-semibold text-purple-deep border-b pb-2 mt-6">Información de Contacto (Opcional)</h3>
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

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-purple-deep text-white py-3 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md mt-6
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <p v-if="errorMessage" class="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">
        {{ errorMessage }}
      </p>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          ¿Ya tienes cuenta? 
          <NuxtLink to="/login" class="font-bold text-purple-deep hover:underline">Inicia sesión aquí</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// (MODIFICADO) 'form' ahora incluye 'confirmPassword'
const form = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  password: '',
  confirmPassword: '', // <-- NUEVO
  telefono: null as number | null,
  region: '',
  comuna: '',
  direccion: ''
});
const errorMessage = ref('');
const isLoading = ref(false); // (NUEVO) Estado de carga

const handleRegister = async () => {
    errorMessage.value = '';
    isLoading.value = true;

    // (NUEVO) Validación de contraseña
    if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'Las contraseñas no coinciden.';
        isLoading.value = false;
        return; // Detiene la ejecución
    }
    
    if (form.value.password.length < 6) {
        errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.';
        isLoading.value = false;
        return; // Detiene la ejecución
    }

    try {
        await $fetch('/api/auth/registro', {
            method: 'POST',
            body: form.value // La API (registro.post.ts) ignorará el campo 'confirmPassword'
        });
        
        router.push('/login?registrado=true');

    } catch (err: any) {
        errorMessage.value = err.data?.statusMessage || 'Error al registrar la cuenta.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped lang="postcss">
.text-purple-dark { color: #4A235A; }
.text-purple-deep { color: #5C2A72; }
.border-purple-deep { border-color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }

/* (NUEVO) Clase reutilizable para inputs */
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
</style>