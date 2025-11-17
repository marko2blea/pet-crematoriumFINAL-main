<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    
    <div class="max-w-2xl mx-auto">
      <!-- Encabezado -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-purple-dark mb-3">Seguimiento de Servicio</h1>
        <p class="text-lg text-gray-600">Ingrese su código de trazabilidad para ver el estado de su reserva.</p>
      </div>

      <!-- Formulario de Búsqueda -->
      <form @submit.prevent="buscarTracking" class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-grow">
            <input 
              v-model="codigoBusqueda"
              type="text" 
              placeholder="Ej: ABC-12345"
              class="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-deep focus:ring-1 focus:ring-purple-deep focus:outline-none transition duration-150 shadow-inner"
              required
            />
            <font-awesome-icon icon="fas fa-barcode" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>
          <button 
            type="submit"
            :disabled="isLoading"
            class="py-4 px-6 bg-purple-deep text-white rounded-xl font-bold hover:bg-purple-light transition duration-150 shadow-lg flex items-center justify-center
                   disabled:opacity-50 disabled:cursor-not-allowed">
            <font-awesome-icon v-if="isLoading" icon="fas fa-spinner" class="animate-spin mr-2" />
            <font-awesome-icon v-else icon="fas fa-search" class="mr-2" />
            <span>{{ isLoading ? 'Buscando...' : 'Buscar' }}</span>
          </button>
        </div>
      </form>

      <!-- Resultados -->
      <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-bd-gold-accent">
          
          <!-- Estado de Carga -->
          <div v-if="isLoading" class="text-center py-6">
              <p class="text-lg text-gray-600">Buscando información...</p>
          </div>
          
          <!-- Estado de Error -->
          <div v-else-if="errorMessage" class="text-center py-6">
              <font-awesome-icon icon="fas fa-exclamation-triangle" class="text-red-500 text-4xl mb-4" />
              <h3 class="text-xl font-bold text-red-700">Error en la Búsqueda</h3>
              <p class="text-gray-600 mt-2">{{ errorMessage }}</p>
          </div>

          <!-- Estado de Éxito -->
          <div v-else-if="resultado" class="space-y-4">
              <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">Resultados del Seguimiento</h2>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
                  <span class="font-semibold text-gray-600">Código:</span>
                  <span class="font-bold text-dark-primary-blue">{{ resultado.codigo }}</span>
                  
                  <span class="font-semibold text-gray-600">Mascota:</span>
                  <span class="font-bold text-dark-primary-blue">{{ resultado.mascota }}</span>
                  
                  <span class="font-semibold text-gray-600">Fecha de Reserva:</span>
                  <span class="font-bold text-dark-primary-blue">{{ resultado.fecha }}</span>
                  
                  <span class="font-semibold text-gray-600">Estado:</span>
                  <span class="px-3 py-1 text-base font-bold rounded-full inline-block" 
                        :class="getStatusClass(resultado.estado)">
                      {{ resultado.estado }}
                  </span>
              </div>
          </div>

          <!-- Estado Inicial -->
          <div v-else class="text-center py-6">
              <p class="text-gray-500">Ingrese un código para ver el estado de su servicio.</p>
          </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // (NUEVO) Para leer la URL
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faBarcode, faSpinner, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

library.add(faSearch, faBarcode, faSpinner, faExclamationTriangle, faCheckCircle);

definePageMeta({
  title: 'Seguimiento'
});

const route = useRoute(); // (NUEVO)

// --- Estado ---
const codigoBusqueda = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// (NUEVO) Tipo para la respuesta de la API
type TrackingResult = {
  codigo: string | null;
  mascota: string;
  fecha: string;
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado' | 'Cancelado';
};
const resultado = ref<TrackingResult | null>(null);


// --- (NUEVO) Cargar desde URL ---
// Esto se ejecuta cuando la página carga
onMounted(() => {
  // 1. Leer el '?codigo=' de la URL
  const codigoUrl = route.query.codigo as string | undefined;

  if (codigoUrl) {
    // 2. Si existe, ponerlo en el formulario
    codigoBusqueda.value = codigoUrl;
    // 3. Y ejecutar la búsqueda automáticamente
    buscarTracking();
  }
});


// --- Funciones ---
const buscarTracking = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  resultado.value = null;

  if (!codigoBusqueda.value) {
    errorMessage.value = 'Por favor, ingrese un código.';
    isLoading.value = false;
    return;
  }

  try {
    // 4. Llamar a la API de tracking (la que ya existe)
    const data = await $fetch<TrackingResult>('/api/tracking', {
      params: { codigo: codigoBusqueda.value }
    });
    resultado.value = data;

  } catch (error: any) {
    console.error('Error en tracking:', error);
    errorMessage.value = error.data?.statusMessage || 'Error al buscar el código.';
  } finally {
    isLoading.value = false;
  }
};

const getStatusClass = (status: TrackingResult['estado']) => {
    switch (status) {
        case 'Pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'En Proceso':
            return 'bg-blue-100 text-blue-800';
        case 'Finalizado':
            return 'bg-green-100 text-green-800';
        case 'Cancelado':
            return 'bg-red-100 text-red-800';
    }
};
</script>

<style scoped>
/* Estilos (Copiados de checkout/reserva) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.bg-purple-light { background-color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; } 
.text-purple-deep { color: #5C2A72; } 
.text-dark-primary-blue { color: #34495e; }
.border-bd-gold-accent { border-color: #FFD700; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }

/* Colores de Badges (Copiados de admin/reservas) */
.bg-yellow-100 { background-color: #fff3cd; }
.text-yellow-800 { color: #856404; }
.bg-blue-100 { background-color: #d1ecf1; }
.text-blue-800 { color: #0c5460; }
.bg-green-100 { background-color: #d4edda; }
.text-green-800 { color: #155724; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-800 { color: #721c24; }
.text-red-500 { color: #dc3545; }
.text-red-700 { color: #b91c1c; }
.bg-red-50 { background-color: #fef2f2; }
</style>