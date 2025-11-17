<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">

    <div v-if="pending" class="text-center p-10 bg-white rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold text-dark-primary-blue">
        Cargando datos de la reserva...
      </h1>
      <p class="text-gray-500 mt-2">Por favor, espere un momento.</p>
    </div>

    <div v-else-if="error || !form" class="text-center p-10 bg-red-50 rounded-xl shadow-lg border border-red-300">
      <h1 class="text-3xl font-bold text-red-700">Error al Cargar la Reserva</h1>
      <p class="text-gray-600 mt-2">{{ error?.statusMessage || 'La reserva no pudo ser encontrada.' }}</p>
      <button @click="router.push('/admin/reservas')"
        class="mt-6 px-5 py-2 bg-purple-dark text-white rounded-lg hover:bg-purple-deep transition shadow-lg">
        Volver a Reservas
      </button>
    </div>
    
    <form v-else @submit.prevent="guardarCambios" class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark">
        <div class="p-6 bg-gray-50 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-purple-dark">Editar Reserva (ID: {{ form.id }})</h1>
            <p class="text-lg text-gray-600 mt-1">{{ loadedData?.cliente }} - {{ loadedData?.servicio }}</p>
        </div>

        <div v-if="saveMessage" 
             :class="saveError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
             class="m-6 p-4 rounded-lg border text-sm font-medium text-center">
            {{ saveMessage }}
        </div>

        <div class="p-6 md:p-8 space-y-6">

            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2">Asignación de Fecha y Hora</h3>
            <p class="text-sm text-gray-600 -mt-3">El código de trazabilidad se genera automáticamente si se asigna la fecha.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="fechaReservada" class="block text-sm font-semibold text-dark-primary-blue mb-2">Fecha Reservada/Entrega</label>
                    <input v-model="form.fechaReservada" type="date" id="fechaReservada"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep" />
                </div>
                <div>
                    <label for="horaReservada" class="block text-sm font-semibold text-dark-primary-blue mb-2">Hora Reservada/Entrega</label>
                    <input v-model="form.horaReservada" type="time" id="horaReservada"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep" />
                </div>
            </div>
            
            <h3 class="text-xl font-semibold text-purple-deep border-b pb-2">Logística y Trazabilidad</h3>
            
            <div>
                <label for="trazabilidad" class="block text-sm font-semibold text-dark-primary-blue mb-2">Código de Trazabilidad (RF01)</label>
                <input v-model="form.codTrazabilidad" type="text" id="trazabilidad"
                       class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep font-mono"
                       placeholder="Ej: ABC-12345" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="estadoPago" class="block text-sm font-semibold text-dark-primary-blue mb-2">Estado del Pago</label>
                    <select v-model="form.estadoPago" id="estadoPago"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep bg-white">
                        <option value="Pendiente">Pendiente (Pago no recibido)</option>
                        <option value="Pagado">Pagado (Pago confirmado)</option>
                        <option value="Cancelado">Cancelado (Reserva anulada)</option>
                    </select>
                </div>
                
                <div>
                    <label for="estadoReserva" class="block text-sm font-semibold text-dark-primary-blue mb-2">Estado de la Reserva (Logística)</label>
                    <select v-model="form.estadoReserva" id="estadoReserva"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep bg-white">
                        <option value="En Proceso">En Proceso (Mascota/Pedido en manos)</option>
                        <option value="Finalizado">Finalizado (Urna/Pedido entregado)</option>
                    </select>
                </div>
            </div>
            
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button 
                type="button" 
                @click="handleDelete" 
                :disabled="isDeleting || isSaving"
                class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 transition duration-150 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                <font-awesome-icon icon="fas fa-trash-alt" class="mr-2" />
                {{ isDeleting ? 'Eliminando...' : 'Eliminar Reserva' }}
            </button>
            
            <div class="space-x-3">
                <button type="button" @click="router.push('/admin/reservas')" 
                        :disabled="isDeleting || isSaving"
                        class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150">
                    Cancelar
                </button>
                <button type="submit" 
                        :disabled="isSaving || isDeleting"
                        class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            </div>
        </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'; 

definePageMeta({
  middleware: 'auth'
});
library.add(faTrashAlt);


const route = useRoute();
const router = useRouter();
const reservaId = ref(route.query.id as string);

// --- Definir Tipos ---
interface ReservaData {
  id: number;
  cliente: string;
  servicio: string;
  codTrazabilidad: string | null;
  estadoReserva: 'En Proceso' | 'Finalizado';
  estadoPago: 'Pendiente' | 'Pagado' | 'Cancelado';
  // (NUEVO)
  fechaReservada: string | null;
  horaReservada: string | null;
}

interface FormState {
  id: number;
  codTrazabilidad: string | null;
  estadoReserva: 'En Proceso' | 'Finalizado';
  estadoPago: 'Pendiente' | 'Pagado' | 'Cancelado';
  // (NUEVO)
  fechaReservada: string | null;
  horaReservada: string | null;
}

// --- Estado del Formulario ---
const form = ref<FormState | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

// --- Carga de Datos ---
const { data: loadedData, pending, error } = await useAsyncData<ReservaData>(
  'reserva-detalle-editable',
  () => {
    if (!reservaId.value) throw createError({ statusCode: 400, statusMessage: 'Falta ID de reserva' });
    return $fetch('/api/admin/reserva-detalle-editable', { query: { id: reservaId.value } })
  },
  { watch: [reservaId] }
);

watchEffect(() => {
  if (loadedData.value) {
    form.value = {
      id: loadedData.value.id,
      codTrazabilidad: loadedData.value.codTrazabilidad,
      estadoReserva: loadedData.value.estadoReserva,
      estadoPago: loadedData.value.estadoPago,
      // (NUEVO)
      fechaReservada: loadedData.value.fechaReservada,
      horaReservada: loadedData.value.horaReservada,
    };
  }
});

// --- Guardar Cambios ---
const guardarCambios = async () => {
  if (!form.value) return;

  // (NUEVO) Validación de fecha
  if (form.value.fechaReservada && !form.value.codTrazabilidad) {
    saveError.value = true;
    saveMessage.value = 'ADVERTENCIA: Debe asignar un Código de Trazabilidad si asigna una fecha.';
    return;
  }

  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    await $fetch('/api/admin/editar-reserva', {
      method: 'PUT',
      body: form.value 
    });

    saveMessage.value = '¡Reserva actualizada con éxito! Redirigiendo...';
    setTimeout(() => {
      router.push('/admin/reservas');
    }, 2000);

  } catch (err: any) {
    isSaving.value = false;
    saveError.value = true;
    saveMessage.value = err.data?.statusMessage || 'Error al guardar la reserva.';
  }
};

// --- Función de Eliminación ---
const handleDelete = async () => {
  if (!form.value) return;

  saveMessage.value = '';
  saveError.value = false;
  
  if (!confirm(`¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la reserva ID ${form.value.id}? Esta acción también borrará el pago y el detalle de la reserva.`)) {
    return;
  }

  isDeleting.value = true;

  try {
    const response = await $fetch('/api/admin/eliminar-reserva', {
      method: 'DELETE',
      body: { id: form.value.id }
    });
    
    saveError.value = false;
    saveMessage.value = response.message + ' Redirigiendo...';
    
    setTimeout(() => {
      router.push('/admin/reservas');
    }, 2000);

  } catch (err: any) {
    isDeleting.value = false;
    saveError.value = true;
    saveMessage.value = err.data?.statusMessage || 'Error al eliminar la reserva.';
  }
};
</script>

<style scoped>
/* Estilos sin cambios */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.border-green-300 { border-color: #c3e6cb; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-700 { color: #721c24; }
.border-red-300 { border-color: #f5c6cb; }
.bg-red-50 { background-color: #fef2f2; }
.bg-red-600 { background-color: #dc3545; }
.hover\:bg-red-800:hover { background-color: #a71d2a; }
</style>