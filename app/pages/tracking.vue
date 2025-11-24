<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    <div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
      <h1 class="text-3xl font-bold mb-8 text-center text-purple-deep">
        <font-awesome-icon icon="fas fa-search-location" class="mr-2" />
        Seguimiento de Pedido / Reserva
      </h1>

      <form @submit.prevent="handleSearch" class="flex flex-col gap-4 mb-8">
        <input 
          type="text"
          v-model="inputCode"
          placeholder="Ingresa tu código de seguimiento"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-light focus:border-purple-light transition duration-150"
        />
        <button 
          type="submit"
          :disabled="loading || !inputCode"
          class="w-full bg-purple-deep text-white font-bold py-3 rounded-lg text-lg hover:bg-purple-light transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Buscando...' : 'Buscar Pedido' }}
        </button>
      </form>

      <div v-if="loading" class="text-center text-purple-deep">
        <font-awesome-icon icon="fas fa-spinner" spin class="text-2xl" />
        <p class="mt-2">Cargando estado...</p>
      </div>
      
      <div v-else-if="error" class="text-center bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
        <font-awesome-icon icon="fas fa-exclamation-triangle" class="mr-2" />
        <p class="font-semibold">{{ error }}</p>
      </div>

      <div v-else-if="trackingData" class="border border-gray-200 p-6 rounded-lg space-y-4 shadow-md bg-gray-50">
        <h2 class="text-xl font-bold text-purple-deep border-b pb-2 mb-3">Detalles de Seguimiento</h2>

        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
          <span class="font-medium text-gray-600">Código:</span>
          <span class="font-extrabold text-purple-deep">{{ trackingData.codigo }}</span>
        </div>

        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
          <span class="font-medium text-gray-600">Artículo:</span>
          <span class="font-bold text-gray-800">{{ trackingData.item }}</span>
        </div>

        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
          <span class="font-medium text-gray-600">Estado Actual:</span>
          <span :class="['px-3 py-1 rounded-full font-semibold text-sm', getStatusColor(trackingData.estado)]">
            {{ formatStatus(trackingData.estado) }}
          </span>
        </div>

        <div v-if="shouldShowDateTime(trackingData.estado, trackingData.fecha)" 
          class="flex justify-between items-center pb-2 border-b border-gray-100">
          <span class="font-medium text-gray-600">Fecha/Hora Asignada:</span>
          <span class="font-bold text-gray-800">{{ formatDisplayDate(trackingData.fecha) }}</span>
        </div>
        
        <div class="flex justify-between items-center pt-3 border-t mt-3 border-gray-200">
          <span class="text-xl font-bold text-purple-deep">Precio Total:</span>
          <span class="text-2xl font-extrabold text-purple-dark">${{ trackingData.precioTotal.toLocaleString('es-CL') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearchLocation, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
library.add(faSearchLocation, faSpinner, faExclamationTriangle);

interface TrackingData {
  codigo: string;
  item: string;
  fecha: string | null;
  estado: string; 
  precioTotal: number;
}

const route = useRoute();
const inputCode = ref<string>('');
const trackingData = ref<TrackingData | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// --- Funciones de Lógica y Visualización ---

const getStatusColor = (estado: string): string => {
  estado = estado.toLowerCase();
  if (estado.includes('finalizad') || estado.includes('entregado')) return 'text-green-700 bg-green-100';
  if (estado.includes('confirmad') || estado.includes('asignad') || estado.includes('tránsito')) return 'text-blue-700 bg-blue-100';
  if (estado.includes('proceso') || estado.includes('esperando') || estado.includes('preparando')) return 'text-yellow-700 bg-yellow-100';
  if (estado.includes('pendiente')) return 'text-orange-700 bg-orange-100'; 
  if (estado.includes('cancelad')) return 'text-red-700 bg-red-100';
  return 'text-gray-600 bg-gray-100';
};

const formatStatus = (estado: string): string => {
  estado = estado.toLowerCase();
  if (estado.includes('pendiente')) return 'Pendiente de Asignación';
  if (estado.includes('confirmad')) return 'Reserva Confirmada';
  if (estado.includes('finalizad')) return 'Servicio Finalizado';
  return estado.charAt(0).toUpperCase() + estado.slice(1);
};

const shouldShowDateTime = (estado: string, fecha: string | null): boolean => {
  if (estado.toLowerCase().includes('pendiente')) {
    return false;
  }
  if (fecha && fecha !== 'N/A') {
    return true;
  }
  return false;
};

const formatDisplayDate = (fecha: string | null): string => {
  if (!fecha || fecha === 'N/A') return 'N/A';
  
  try {
    const dateObj = new Date(fecha);
    return dateObj.toLocaleDateString('es-CL') + ' ' + dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return fecha;
  }
};

// --- Funciones de Llamada a la API ---

const fetchTrackingData = async (code: string) => {
  loading.value = true;
  error.value = null;
  trackingData.value = null;

  try {
    // Usamos $fetch (asumiendo que estás en Nuxt)
    const response = await $fetch<TrackingData>(`/api/tracking`, {
      method: 'GET',
      query: { codigo: code },
    });
    
    trackingData.value = response;

  } catch (err: any) {
    error.value = err.data?.statusMessage || 'No se pudo obtener la información de seguimiento. Código inválido o pedido no encontrado.';
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  if (inputCode.value) {
    fetchTrackingData(inputCode.value);
  }
};


onMounted(() => {
  const code = route.query.codigo as string;
  if (code) {
    inputCode.value = code;
    fetchTrackingData(code);
  }
});
</script>

<style scoped lang="postcss">
/* Definiciones de color para Tailwind */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }

/* Estilos de enfoque */
.focus\:ring-purple-light:focus {
  --tw-ring-color: #6C3483;
}
.focus\:border-purple-light:focus {
  border-color: #6C3483;
}
/* Mejoras en el diseño de la tarjeta */
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
}
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>