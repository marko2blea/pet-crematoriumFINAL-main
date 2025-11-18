<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    <div class="max-w-4xl mx-auto">

      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-purple-dark mb-3">Editar Reserva</h1>
        <p class="text-lg text-gray-600">Aquí puedes revisar y actualizar los datos de tu reserva.</p>
      </div>

      <div v-if="isLoading" class="mb-4 p-4 rounded-lg text-center text-lg bg-blue-100 border border-blue-400 text-blue-700">
        Cargando datos...
      </div>

      <div v-if="errorMessage" class="mb-4 p-4 rounded-lg text-center text-sm bg-red-100 border border-red-400 text-red-700">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="guardarCambios" v-if="loadedData" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark">
          <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">Datos de Reserva</h2>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Código de Trazabilidad</label>
            <input type="text" v-model="form.codTrazabilidad" readonly class="form-input"/>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Estado Reserva</label>
            <select v-model="form.estadoReserva" class="form-input">
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Fecha Reservada</label>
            <input type="date" v-model="form.fechaReservada" class="form-input"/>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Hora Reservada</label>
            <input type="time" v-model="form.horaReservada" class="form-input"/>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Estado Pago</label>
            <input type="text" v-model="form.estadoPago" readonly class="form-input bg-gray-100"/>
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <button type="submit" :disabled="isLoading" class="w-full py-3 rounded-xl font-bold text-lg bg-purple-deep text-white hover:bg-purple-light transition shadow-lg">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ReservaForm {
  id: number;
  codTrazabilidad: string;
  estadoReserva: string;
  estadoPago: string;
  fechaReservada: string | null;
  horaReservada: string | null;
}

const route = useRoute();
const router = useRouter();

const loadedData = ref<any>(null);
const isLoading = ref(false);
const errorMessage = ref('');

const form = ref<ReservaForm>({
  id: 0,
  codTrazabilidad: '',
  estadoReserva: '',
  estadoPago: '',
  fechaReservada: null,
  horaReservada: null,
});

async function cargarReserva() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const idPedido = route.query.id;
    if (!idPedido) throw new Error('Falta ID del pedido');

    const data = await $fetch(`/api/admin/reserva-detalle-editable?id_pedido=${idPedido}`);
    loadedData.value = data;

    const r = data.reserva;
    const p = data.pago;

    form.value = {
      id: data.id_pedido,
      codTrazabilidad: r?.cod_trazabilidad ?? '',
      estadoReserva: r?.estado_reserva ?? '',
      estadoPago: p?.estado ?? '',
      fechaReservada: r?.fecha_reservada ? new Date(r.fecha_reservada).toISOString().substring(0,10) : null,
      horaReservada: r?.hora_reservada ? new Date(r.hora_reservada).toISOString().substring(11,16) : null,
    };
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Error al cargar la reserva';
  } finally {
    isLoading.value = false;
  }
}

async function guardarCambios() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const body = {
      id_reserva: loadedData.value.reserva?.id_reserva,
      estado_reserva: form.value.estadoReserva,
      cod_trazabilidad: form.value.codTrazabilidad,
      fecha_reservada: form.value.fechaReservada,
      hora_reservada: form.value.horaReservada,
      precio_total: loadedData.value.precio_total,
      id_pedido: loadedData.value.id_pedido,
    };
    await $fetch('/api/admin/editar-reserva', {
      method: 'PUT',
      body
    });

    alert('Reserva actualizada correctamente');
    router.push('/admin/reservas');
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Error al guardar cambios';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  cargarReserva();
});
</script>

<style scoped lang="postcss">
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep focus:border-purple-deep;
}
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.border-bd-gold-accent { border-color: #FFD700; }
</style>
