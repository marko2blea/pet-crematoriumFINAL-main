<template>
	<div class="p-8">
		<h1 class="text-3xl font-bold mb-8 text-purple-deep">
			<font-awesome-icon icon="fas fa-edit" class="mr-2 text-purple-light" />
			Editar Reserva #{{ idReserva || '...' }}
		</h1>

		<div v-if="loading" class="text-center p-10 bg-gray-50 rounded-lg">
			<font-awesome-icon icon="fas fa-spinner" spin class="text-4xl text-purple-deep" />
			<p class="mt-4 text-gray-600">Cargando detalles de la reserva...</p>
		</div>
		
		<div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
			<p>Error: {{ error }}</p>
		</div>

		<form v-else @submit.prevent="handleSubmit" class="bg-white p-8 rounded-xl shadow-2xl space-y-8">
			
			<div class="border border-purple-light/50 bg-purple-100/30 p-4 rounded-lg">
				<p class="text-sm font-semibold text-gray-700 mb-2">Código de Trazabilidad:</p>
				<p class="text-xl font-extrabold text-purple-dark">{{ reservaForm.cod_trazabilidad }}</p>
			</div>

			<h2 class="text-xl font-semibold border-b pb-3 text-dark-primary-blue">Datos del Cliente y Pedido</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div class="p-3 bg-gray-50 rounded-lg">
					<label class="block text-sm font-medium text-purple-deep">Cliente</label>
					<p class="mt-1 font-bold text-gray-800">{{ reservaForm.nombre_cliente }}</p>
				</div>
				<div class="p-3 bg-gray-50 rounded-lg">
					<label class="block text-sm font-medium text-purple-deep">Correo</label>
					<p class="mt-1 text-gray-800">{{ reservaForm.correo_cliente }}</p>
				</div>
				<div class="p-3 bg-gray-50 rounded-lg">
					<label class="block text-sm font-medium text-purple-deep">Precio Total</label>
					<p class="mt-1 text-xl font-extrabold text-green-600">${{ reservaForm.precio_total?.toLocaleString('es-CL') ?? '0' }}</p>
				</div>
				<div class="p-3 bg-gray-50 rounded-lg">
					<label class="block text-sm font-medium text-purple-deep">Servicio</label>
					<p class="mt-1 text-gray-800">{{ reservaForm.nombre_servicio }} ({{ reservaForm.tipo_servicio }})</p>
				</div>
			</div>

			<h2 class="text-xl font-semibold border-b pb-3 pt-4 text-dark-primary-blue">Asignación de Horario y Estado</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div>
					<label for="estado" class="block text-sm font-medium text-gray-700">Estado de la Reserva</label>
					<select id="estado" v-model="reservaForm.estado_reserva" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep">
						<option value="Pendiente">Pendiente</option>
						<option value="Confirmada">Confirmada</option>
						<option value="En Proceso">En Proceso (Cremación)</option>
						<option value="Finalizada">Finalizada (Lista para entrega)</option>
						<option value="Cancelada">Cancelada</option>
					</select>
				</div>
				<div>
					<label for="fecha" class="block text-sm font-medium text-gray-700">Fecha Reservada</label>
					<input type="date" id="fecha" v-model="reservaForm.fecha_reservada" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep" />
				</div>
				<div>
					<label for="hora" class="block text-sm font-medium text-gray-700">Hora Reservada</label>
					<input type="time" id="hora" v-model="reservaForm.hora_reservada" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep" />
				</div>
			</div>

			<div class="flex justify-end space-x-4 pt-6">
				<button type="button" @click="handleCancel" class="inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 transition duration-150">
					Cancelar
				</button>
				<button type="submit" 
						:disabled="saving"
						class="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-deep hover:bg-purple-light transition duration-150 disabled:opacity-50">
					<font-awesome-icon v-if="saving" icon="fas fa-spinner" spin class="mr-2" />
					<font-awesome-icon v-else icon="fas fa-save" class="mr-2" />
					Guardar Cambios
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSave, faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons';
library.add(faSave, faSpinner, faEdit);

// Interfaz que coincide con la respuesta aplanada del backend
interface ReservaDetalle {
    id_reserva: number;
    cod_trazabilidad: string;
    estado_reserva: string;
    fecha_reservada: string; 
    hora_reservada: string; 
    precio_total: number;
    nombre_cliente: string;
    correo_cliente: string;
    nombre_servicio: string;
    tipo_servicio: string;
    region: string | null;
    comuna: string | null;
    direccion: string | null;
    id_pedido: number;
}

const reservaForm = ref<Partial<ReservaDetalle>>({}); 
const idReserva = ref<number | null>(null);
const loading = ref(true);
const saving = ref(false); // Estado para el botón de guardar
const error = ref<string | null>(null);
const route = useRoute();
const router = useRouter(); // Usamos router para la navegación

const fetchReservaData = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
        const response = await $fetch<ReservaDetalle>(`/api/admin/reserva-detalle-editable`, {
            query: { id_reserva: id },
        });

        reservaForm.value = response;

    } catch (e: any) {
        console.error("Error al cargar la reserva:", e);
        error.value = e.data?.statusMessage || "Error desconocido al cargar la información. Revise la consola.";
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    // Redirigir a la lista de reservas o al dashboard principal
    router.push('/admin/dashboard'); 
};

const handleSubmit = async () => {
    saving.value = true;
    error.value = null;

    try {
        // Enviar solo los campos editables y el ID
        const payload = {
            id_reserva: idReserva.value,
            estado_reserva: reservaForm.value.estado_reserva,
            fecha_reservada: reservaForm.value.fecha_reservada,
            hora_reservada: reservaForm.value.hora_reservada,
        };

        const response = await $fetch(`/api/admin/editar-reserva.put`, {
            method: 'PUT',
            body: payload,
        });

        alert(response.message);
        // Opcional: Redirigir a la lista o recargar la página
        // router.push('/admin/reservas'); 
        
    } catch (e: any) {
        console.error('Error al guardar:', e);
        error.value = e.data?.statusMessage || 'Fallo al guardar. Revisa la consola para más detalles.';
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    const id = route.query.id as string;
    if (id && !isNaN(parseInt(id))) {
        idReserva.value = parseInt(id);
        fetchReservaData(idReserva.value);
    } else {
        error.value = "ID de reserva no válido.";
        loading.value = false;
    }
});
</script>

<style scoped>
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
</style>