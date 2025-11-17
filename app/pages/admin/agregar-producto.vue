<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    <form @submit.prevent="guardarCambios" class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Agregar Nuevo Producto</h1>
            <p class="text-lg text-gray-600 mt-1">Complete los detalles del nuevo ítem de inventario.</p>
        </div>

        <div v-if="saveMessage" 
             :class="saveError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
             class="m-6 p-4 rounded-lg border text-sm font-medium text-center">
            {{ saveMessage }}
        </div>

        <div class="p-6 md:p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="nombre" class="block text-sm font-semibold text-dark-primary-blue mb-2">Nombre del Producto</label>
                    <input v-model="form.nombre" type="text" id="nombre" class="form-input" required />
                </div>
                
                <div>
                    <label for="tipo" class="block text-sm font-semibold text-dark-primary-blue mb-2">Tipo de Producto</label>
                    <select v-model="form.tipo" id="tipo" class="form-input bg-white">
                        <option value="Urna">Urna</option>
                        <option value="Servicio">Servicio</option>
                        <option value="Accesorio">Accesorio</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label for="stock" class="block text-sm font-semibold text-dark-primary-blue mb-2">Stock Inicial</label>
                    <input v-model.number="form.stock" type="number" id="stock" class="form-input" required />
                </div>
                
                <div>
                    <label for="precio" class="block text-sm font-semibold text-dark-primary-blue mb-2">Precio Unitario (CLP)</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input v-model.number="form.precio" type="number" id="precio" class="form-input pl-7" required />
                    </div>
                </div>

                <div>
                    <label for="disponible" class="block text-sm font-semibold text-dark-primary-blue mb-2">Disponibilidad</label>
                    <select v-model="form.disponible" id="disponible" class="form-input bg-white">
                        <option :value="true">Disponible</option>
                        <option :value="false">Agotado / No Disponible</option>
                    </select>
                </div>
            </div>

            <div>
                <label for="descripcion" class="block text-sm font-semibold text-dark-primary-blue mb-2">Descripción</label>
                <textarea v-model="form.descripcion" id="descripcion" rows="3" class="form-input"></textarea>
            </div>
            
            <div>
                <label for="imagen_url" class="block text-sm font-semibold text-dark-primary-blue mb-2">URL de Imagen</label>
                <input v-model="form.imagen_url" type="text" id="imagen_url" class="form-input" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            <div>
                <label for="proveedor" class="block text-sm font-semibold text-dark-primary-blue mb-2">Proveedor</label>
                <select v-model="form.id_proveedor" id="proveedor" class="form-input bg-white">
                    <option :value="null">-- Sin Proveedor --</option>
                    <option v-if="pendingProveedores">Cargando...</option>
                    <option v-for="proveedor in proveedores" :key="proveedor.id_proveedor" :value="proveedor.id_proveedor">
                        {{ proveedor.proveedor }}
                    </option>
                </select>
            </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" @click="router.push('/admin/inventario')" class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150">
                Cancelar
            </button>
            <button type="submit" :disabled="isSaving" class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSaving ? 'Creando...' : 'Crear Producto' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Proveedor {
    id_proveedor: number;
    proveedor: string | null; // (CORREGIDO) Acepta null
}

const form = ref({
  nombre: '',
  stock: 0,
  precio: 0,
  disponible: true,
  tipo: 'Urna',
  id_proveedor: null as number | null,
  descripcion: '',
  imagen_url: ''
});

const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

// (CORREGIDO) Carga real de proveedores
const { data: proveedores, pending: pendingProveedores } = await useAsyncData('lista-proveedores', 
  () => $fetch<Proveedor[]>('/api/admin/proveedores')
);

const guardarCambios = async () => {
  if (!form.value) return;

  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    await $fetch('/api/admin/agregar-producto', {
      method: 'POST',
      body: form.value
    });

    saveMessage.value = '¡Producto creado con éxito! Redirigiendo...';
    setTimeout(() => {
      router.push('/admin/inventario');
    }, 2000);

  } catch (err: any) {
    isSaving.value = false;
    saveError.value = true;
    saveMessage.value = err.data?.statusMessage || 'Error al crear el producto.';
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
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.border-green-300 { border-color: #c3e6cb; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-700 { color: #721c24; }
.border-red-300 { border-color: #f5c6cb; }
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
.form-input.pl-7 {
  padding-left: 1.75rem;
}
</style>