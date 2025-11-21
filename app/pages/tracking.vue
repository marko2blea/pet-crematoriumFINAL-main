<template>
	<div class="pt-14 py-20 min-h-screen container mx-auto px-4">
		<div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
			<h1 class="text-3xl font-bold mb-8 text-center text-purple-deep">
				<font-awesome-icon icon="fas fa-search-location" class="mr-2" />
				Seguimiento de Pedido / Reserva
			</h1>

			<form @submit.prevent="handleSearch" class="flex flex-col gap-4 mb-8">
				<input type="text"
					v-model="inputCode"
					placeholder="Ingresa tu código de seguimiento"
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-light focus:border-purple-light transition duration-150"
				/>
				<button type="submit"
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

			<div v-else-if="trackingData" class="border border-gray-200 p-6 rounded-lg space-y-4">
				<h2 class="text-xl font-bold text-gray-800 border-b pb-2 mb-3">Detalles de Seguimiento</h2>

				<div class="flex justify-between items-center">
					<span class="font-medium text-gray-600">Código:</span>
					<span class="font-bold text-dark-primary-blue">{{ trackingData.codigo }}</span>
				</div>

				<div class="flex justify-between items-center">
					<span class="font-medium text-gray-600">Artículo:</span>
					<span class="font-bold text-gray-800">{{ trackingData.item }}</span>
				</div>

				<div class="flex justify-between items-center">
					<span class="font-medium text-gray-600">Estado Actual:</span>
					<span :class="['px-3 py-1 rounded-full font-semibold text-sm', getStatusColor(trackingData.estado)]">
						{{ trackingData.estado }}
					</span>
				</div>

				<div v-if="trackingData.fecha && trackingData.fecha !== 'N/A'" class="flex justify-between items-center">
					<span class="font-medium text-gray-600">Fecha/Hora Asignada:</span>
					<span class="font-bold text-gray-800">{{ trackingData.fecha }}</span>
				</div>
                
				<div class="flex justify-between items-center pt-3 border-t mt-3">
					<span class="text-xl font-bold text-dark-primary-blue">Precio Total:</span>
					<span class="text-2xl font-extrabold text-purple-dark">${{ trackingData.precioTotal.toLocaleString('es-CL') }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// Importamos los iconos necesarios para el diseño
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearchLocation, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
library.add(faSearchLocation, faSpinner, faExclamationTriangle);


// Interfaz que coincide con la respuesta de server/api/tracking.get.ts
interface TrackingData {
  codigo: string;
  item: string;
  fecha: string; 
  estado: string; 
  precioTotal: number; // Nuevo
}

const route = useRoute();
const inputCode = ref<string>(''); // Código ingresado en el input
const trackingData = ref<TrackingData | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Mapeo de estados a clases CSS (La lógica principal se hace en la API para centralizar)
const getStatusColor = (estado: string): string => {
    estado = estado.toLowerCase();
    if (estado.includes('finalizad') || estado.includes('entregado')) return 'text-green-600 bg-green-100';
    if (estado.includes('asignad') || estado.includes('confirmad') || estado.includes('tránsito')) return 'text-blue-600 bg-blue-100';
    if (estado.includes('proceso') || estado.includes('esperando') || estado.includes('preparando')) return 'text-yellow-700 bg-yellow-200';
    if (estado.includes('pendiente')) return 'text-red-500 bg-red-100';
    if (estado.includes('cancelad')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
};


const fetchTrackingData = async (code: string) => {
  loading.value = true;
  error.value = null;
  trackingData.value = null;

  try {
    const response = await $fetch<TrackingData>(`/api/tracking`, {
      method: 'GET',
      query: { codigo: code },
    });
    
    trackingData.value = response;

  } catch (err: any) {
    error.value = err.data?.statusMessage || 'No se pudo obtener la información de seguimiento.';
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
  // Si el código viene de la redirección del checkout, lo buscamos inmediatamente
  const code = route.query.codigo as string;
  if (code) {
    inputCode.value = code;
    fetchTrackingData(code);
  }
});
</script>

<style scoped lang="postcss">
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }

/* Asegura que el foco del input sea consistente */
.focus\:ring-purple-light:focus {
    --tw-ring-color: #6C3483;
}
.focus\:border-purple-light:focus {
    border-color: #6C3483;
}
</style>