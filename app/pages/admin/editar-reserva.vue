<template>
  <div class="min-h-screen pt-20 pb-10 bg-gray-50">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Título -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-purple-deep flex items-center gap-2">
          <font-awesome-icon icon="fas fa-edit" class="text-purple-light" />
          <span>
            {{ reservaForm.es_reserva ? 'Editar Reserva' : 'Detalle de Pedido' }}
            <span v-if="idPedido" class="text-sm md:text-base text-gray-500">
              #{{ idPedido }}
            </span>
          </span>
        </h1>

        <span
          v-if="reservaForm.es_reserva"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-deep"
        >
          Reserva de Servicio
        </span>
        <span
          v-else
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
        >
          Pedido Solo Productos
        </span>
      </div>

      <!-- Estado de carga / error -->
      <div
        v-if="loading"
        class="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center"
      >
        <font-awesome-icon icon="fas fa-spinner" spin class="text-3xl text-purple-deep" />
        <p class="mt-4 text-gray-600">Cargando detalles...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-md p-6"
      >
        <p class="font-semibold mb-1">Error</p>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Tarjeta principal -->
      <form
        v-else
        @submit.prevent="handleSubmit"
        class="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6"
      >
        <!-- Encabezado con código y precio -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 pb-4">
          <div class="md:col-span-2 bg-purple-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Código de Trazabilidad
              </p>
              <p class="mt-1 text-lg font-extrabold text-purple-deep">
                {{ reservaForm.cod_trazabilidad || 'N/A' }}
              </p>
            </div>
            <div class="text-right text-xs text-gray-500">
              <p v-if="reservaForm.es_reserva">
                Reserva asociada a pedido #{{ idPedido }}
              </p>
              <p v-else>
                Pedido de productos
              </p>
            </div>
          </div>
          <div class="bg-green-50 rounded-xl p-3">
            <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Precio Total
            </p>
            <p class="mt-1 text-xl font-extrabold text-green-700">
              {{
                (reservaForm.precio_total || 0).toLocaleString('es-CL', {
                  style: 'currency',
                  currency: 'CLP'
                })
              }}
            </p>
          </div>
        </div>

        <!-- Datos del cliente -->
        <section class="space-y-3">
          <h2 class="text-sm font-semibold text-dark-primary-blue border-b border-gray-200 pb-2">
            Datos del Cliente
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Cliente</p>
              <p class="mt-1 text-sm font-semibold text-gray-800">
                {{ reservaForm.nombre_cliente || 'N/A' }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Correo</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.correo_cliente || 'N/A' }}
              </p>
            </div>
          </div>
        </section>

        <!-- Datos de la mascota (solo si es reserva y hay datos) -->
        <section
          v-if="reservaForm.es_reserva && reservaForm.mascota_datos && reservaForm.mascota_datos.nombre !== 'N/A'"
          class="space-y-3"
        >
          <h2 class="text-sm font-semibold text-dark-primary-blue border-b border-gray-200 pb-2">
            Datos de la Mascota
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Nombre</p>
              <p class="mt-1 text-sm font-semibold text-gray-800">
                {{ reservaForm.mascota_datos?.nombre }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Peso (kg)</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.mascota_datos?.peso ?? 'N/A' }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Edad</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.mascota_datos?.edad ?? 'N/A' }}
              </p>
            </div>
          </div>
        </section>

        <!-- Servicio reservado (solo si es reserva y hay servicio) -->
        <section
          v-if="reservaForm.es_reserva && reservaForm.nombre_servicio && reservaForm.nombre_servicio !== 'N/A'"
          class="space-y-3"
        >
          <h2 class="text-sm font-semibold text-dark-primary-blue border-b border-gray-200 pb-2">
            Servicio Reservado
          </h2>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-sm font-bold text-gray-800">
              {{ reservaForm.nombre_servicio }}
              <span
                v-if="reservaForm.tipo_servicio"
                class="ml-2 text-xs font-medium text-purple-deep"
              >
                ({{ reservaForm.tipo_servicio }})
              </span>
            </p>
          </div>
        </section>

        <!-- Productos comprados (para ambos casos) -->
        <section
          v-if="reservaForm.productos_comprados && reservaForm.productos_comprados.length > 0"
          class="space-y-3"
        >
          <h2 class="text-sm font-semibold text-dark-primary-blue border-b border-gray-200 pb-2">
            Productos Comprados
          </h2>
          <div class="space-y-2">
            <div
              v-for="(producto, index) in reservaForm.productos_comprados"
              :key="index"
              class="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p class="text-sm font-medium text-gray-800">
                  {{ producto.nombre }}
                </p>
                <p class="text-xs text-gray-500">
                  Cantidad: {{ producto.cantidad }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-purple-deep">
                  {{
                    (producto.precio || 0).toLocaleString('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Dirección (si existe algo) -->
        <section
          v-if="reservaForm.region || reservaForm.comuna || reservaForm.direccion"
          class="space-y-3"
        >
          <h2 class="text-sm font-semibold text-dark-primary-blue border-b border-gray-200 pb-2">
            Dirección / Entrega
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Región</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.region || 'N/A' }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Comuna</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.comuna || 'N/A' }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs font-medium text-purple-deep uppercase">Dirección</p>
              <p class="mt-1 text-sm text-gray-800">
                {{ reservaForm.direccion || 'N/A' }}
              </p>
            </div>
          </div>
        </section>

        <!-- Ajuste de horario y estado -->
        <section class="space-y-3 border-t border-gray-200 pt-4">
          <h2 class="text-sm font-semibold text-dark-primary-blue">
            Ajuste de Horario y Estado
          </h2>

          <!-- Caso: ES RESERVA (servicio) -->
          <div
            v-if="reservaForm.es_reserva"
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label for="estado" class="block text-xs font-medium text-gray-700 mb-1">
                Estado de la Reserva
              </label>
              <select
                id="estado"
                v-model="reservaForm.estado_reserva"
                class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-purple-deep focus:border-purple-deep"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="En Proceso">En Proceso (Cremación)</option>
                <option value="Finalizada">Finalizada (Lista para entrega)</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label for="fecha" class="block text-xs font-medium text-gray-700 mb-1">
                Fecha Reservada
              </label>
              <input
                type="date"
                id="fecha"
                v-model="reservaForm.fecha_reservada"
                class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-purple-deep focus:border-purple-deep"
              />
            </div>
            <div>
              <label for="hora" class="block text-xs font-medium text-gray-700 mb-1">
                Hora Reservada
              </label>
              <input
                type="time"
                id="hora"
                v-model="reservaForm.hora_reservada"
                class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-purple-deep focus:border-purple-deep"
              />
            </div>
          </div>

          <!-- Caso: SOLO PRODUCTOS -->
          <div v-else class="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label
                for="estadoPedido"
                class="block text-xs font-medium text-gray-700 mb-1"
              >
                Estado del Pedido / Envío
              </label>
              <select
                id="estadoPedido"
                v-model="reservaForm.estado_reserva"
                class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-purple-deep focus:border-purple-deep"
              >
                <option value="Confirmado">Confirmado</option>
                <option value="Preparando producto">Preparando producto</option>
                <option value="En tránsito">En tránsito</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Botones -->
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-gray-200 pt-4 mt-2"
        >
          <button
            type="button"
            @click="handleDelete"
            :disabled="saving"
            class="inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
          >
            <font-awesome-icon icon="fas fa-trash" class="mr-2" />
            Borrar Registro
          </button>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="handleCancel"
              class="inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-deep hover:bg-purple-light disabled:opacity-50 transition"
            >
              <font-awesome-icon
                v-if="saving"
                icon="fas fa-spinner"
                spin
                class="mr-2"
              />
              <font-awesome-icon v-else icon="fas fa-save" class="mr-2" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSave, faSpinner, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

library.add(faSave, faSpinner, faEdit, faTrash);

interface ProductoComprado {
  nombre: string;
  cantidad: number;
  precio: number;
  tipo?: string;
}

interface MascotaDatos {
  nombre: string;
  peso: number | null;
  edad: number | null;
}

interface ReservaDetalle {
  id_pedido: number;
  id_reserva: number | null;
  es_reserva: boolean;

  cod_trazabilidad: string | null;
  estado_reserva: string;
  fecha_reservada: string;
  hora_reservada: string;
  precio_total: number;

  nombre_cliente: string;
  correo_cliente: string;

  nombre_servicio?: string;
  tipo_servicio?: string;

  region?: string | null;
  comuna?: string | null;
  direccion?: string | null;

  mascota_datos: MascotaDatos | null;
  productos_comprados: ProductoComprado[];
}

const reservaForm = ref<Partial<ReservaDetalle>>({});
const idPedido = ref<number | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

const route = useRoute();
const router = useRouter();

const fetchReservaData = async (id: number) => {
  loading.value = true;
  error.value = null;
  try {
    const response = (await $fetch('/api/admin/reserva-detalle-editable', {
      query: { id }
    })) as ReservaDetalle;

    if (!response.mascota_datos) {
      response.mascota_datos = { nombre: 'N/A', peso: null, edad: null };
    }
    if (!response.productos_comprados) {
      response.productos_comprados = [];
    }

    reservaForm.value = response;
  } catch (e: any) {
    console.error('Error al cargar la reserva/pedido:', e);
    error.value =
      e.data?.statusMessage ||
      'Error desconocido al cargar la información. Revise la consola del servidor.';
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/admin/dashboard');
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = null;

  if (!idPedido.value) {
    error.value = 'Error: ID de pedido no válido para guardar.';
    saving.value = false;
    return;
  }

  try {
    const payload = {
      id_pedido: idPedido.value,
      id_reserva: reservaForm.value.id_reserva ?? null,
      es_reserva: !!reservaForm.value.es_reserva,
      estado_reserva: reservaForm.value.estado_reserva || 'Pendiente',
      fecha_reservada: reservaForm.value.es_reserva
        ? reservaForm.value.fecha_reservada || null
        : null,
      hora_reservada: reservaForm.value.es_reserva
        ? reservaForm.value.hora_reservada || null
        : null
    };

    const response = (await $fetch('/api/admin/editar-reserva', {
      method: 'PUT',
      body: payload
    })) as { message: string };

    alert(response.message);
    router.push('/admin/dashboard');
  } catch (e: any) {
    console.error('Error al guardar:', e);
    error.value = e.data?.statusMessage || 'Fallo al guardar. Revise la consola.';
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (!idPedido.value) return;

  if (
    !confirm(
      `¿Estás seguro de que deseas eliminar el registro asociado al pedido #${idPedido.value}? Esta acción es irreversible.`
    )
  ) {
    return;
  }

  saving.value = true;
  error.value = null;

  try {
    const response = (await $fetch('/api/admin/eliminar-reserva', {
      method: 'DELETE',
      query: { id: idPedido.value }
    })) as { message: string };

    alert(response.message);
    router.push('/admin/dashboard');
  } catch (e: any) {
    console.error('Error al eliminar:', e);
    error.value =
      e.data?.statusMessage ||
      'Fallo al eliminar el registro. Verifique la configuración del backend.';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  const id = route.query.id as string;
  if (id && !isNaN(parseInt(id))) {
    idPedido.value = parseInt(id);
    fetchReservaData(idPedido.value);
  } else {
    error.value = 'ID de pedido no válido.';
    loading.value = false;
  }
});
</script>

<style scoped>
.text-purple-dark {
  color: #4a235a;
}
.bg-purple-dark {
  background-color: #4a235a;
}
.bg-purple-light {
  background-color: #6c3483;
}
.bg-purple-deep {
  background-color: #5c2a72;
}
.text-purple-deep {
  color: #5c2a72;
}
.text-dark-primary-blue {
  color: #34495e;
}
.bg-purple-card {
  background-color: #fcfaff;
}
</style>
