<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">

    <div v-if="!form" class="text-center p-10 bg-white rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold text-dark-primary-blue">
        Cargando perfil...
      </h1>
    </div>
    
    <form v-else @submit.prevent="guardarPerfil" class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Editar Mi Cuenta</h1>
            <p class="text-lg text-gray-600 mt-1">Actualiza tu información personal y de contacto.</p>
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
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" @click="router.back()" 
                    class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150">
                Cancelar
            </button>
            <button type="submit" 
                    :disabled="isSaving"
                    class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSaving ? 'Guardando...' : 'Guardar Perfil' }}
            </button>
        </div>
    </form>

    <form v-if="form" @submit.prevent="guardarPassword" class="mt-12 max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-yellow-500">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Cambiar Contraseña</h1>
        </div>

        <div v-if="passMessage" 
             :class="passError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
             class="m-6 p-4 rounded-lg border text-sm font-medium text-center">
            {{ passMessage }}
        </div>

        <div class="p-6 md:p-8 space-y-6">
            <div>
                <label for="currentPassword" class="block text-sm font-semibold text-dark-primary-blue mb-2">Contraseña Actual</label>
                <input v-model="passForm.currentPassword" type="password" id="currentPassword" class="form-input" required />
            </div>
            <div>
                <label for="newPassword" class="block text-sm font-semibold text-dark-primary-blue mb-2">Nueva Contraseña</label>
                <input v-model="passForm.newPassword" type="password" id="newPassword" class="form-input" required />
            </div>
            <div>
                <label for="confirmPassword" class="block text-sm font-semibold text-dark-primary-blue mb-2">Confirmar Nueva Contraseña</label>
                <input v-model="passForm.confirmPassword" type="password" id="confirmPassword" class="form-input" required />
            </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button type="submit" 
                    :disabled="isSavingPass"
                    class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSavingPass ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
        </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '../../app/types';

// 1. Proteger esta página
definePageMeta({
  middleware: 'auth'
});

const router = useRouter();
const user = useUser(); 

// --- Estado Formulario 1 (Datos Personales) ---
const form = ref<Partial<User> | null>(null);
const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

// --- (NUEVO) Estado Formulario 2 (Contraseña) ---
const passForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const isSavingPass = ref(false);
const passMessage = ref('');
const passError = ref(false);

// 2. Rellenar el formulario de Datos Personales
onMounted(() => {
  if (user.value) { 
    form.value = structuredClone(user.value);
  } else {
    saveError.value = true;
    saveMessage.value = "Error: No se pudo cargar la información del usuario.";
  }
});


// --- Guardar Cambios (Datos Personales) ---
const guardarPerfil = async () => {
  if (!form.value) return;

  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    const response = await $fetch('/api/usuario/editar-perfil', {
      method: 'PUT',
      body: {
        id_usuario: form.value.id_usuario,
        nombre: form.value.nombre,
        apellido_paterno: form.value.apellido_paterno,
        apellido_materno: form.value.apellido_materno,
        telefono: form.value.telefono,
        region: form.value.region,
        comuna: form.value.comuna,
        direccion: form.value.direccion,
      }
    });

    user.value = response.user;
    saveMessage.value = '¡Perfil actualizado con éxito!';
    saveError.value = false;

  } catch (err: any) {
    saveError.value = true;
    saveMessage.value = err.data?.statusMessage || 'Error al guardar el perfil.';
  } finally {
    isSaving.value = false;
  }
};

// --- (NUEVO) Guardar Cambios (Contraseña) ---
const guardarPassword = async () => {
  if (!user.value) return;

  isSavingPass.value = true;
  passMessage.value = '';
  passError.value = false;

  // Validación simple
  if (passForm.value.newPassword !== passForm.value.confirmPassword) {
    passError.value = true;
    passMessage.value = 'Las nuevas contraseñas no coinciden.';
    isSavingPass.value = false;
    return;
  }
  
  if (passForm.value.newPassword.length < 6) {
    passError.value = true;
    passMessage.value = 'La nueva contraseña debe tener al menos 6 caracteres.';
    isSavingPass.value = false;
    return;
  }

  try {
    // Llamar a la nueva API de contraseña
    const response = await $fetch('/api/usuario/cambiar-contrasena', {
      method: 'PUT',
      body: {
        id_usuario: user.value.id_usuario,
        currentPassword: passForm.value.currentPassword,
        newPassword: passForm.value.newPassword
      }
    });

    passMessage.value = response.message;
    passError.value = false;
    // Limpiar formulario de contraseña
    passForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };

  } catch (err: any) {
    passError.value = true;
    passMessage.value = err.data?.statusMessage || 'Error al actualizar la contraseña.';
  } finally {
    isSavingPass.value = false;
  }
};
</script>

<style scoped lang="postcss">
/* (Estilos de editar-cuenta.vue) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.border-green-300 { border-color: #c3e6cb; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-700 { color: #721c24; }
.border-red-300 { border-color: #f5c6cb; }
.border-yellow-500 { border-color: #f59e0b; } /* Para el nuevo formulario */

/* (CORREGIDO) Añadidas las definiciones de 'ring' y 'border' */
.focus\:ring-purple-deep:focus { 
    --tw-ring-color: #5C2A72; 
}
.focus\:border-purple-deep:focus { 
    border-color: #5C2A72; 
}

/* Clase reutilizable para inputs */
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
</style>