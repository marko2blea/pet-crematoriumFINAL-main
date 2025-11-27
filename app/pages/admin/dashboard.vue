<template>
  <div class="pt-14 py-16 min-h-screen container mx-auto px-4 space-y-8 dashboard-fade-in">
    <!-- Título -->
    <div class="border-b-2 border-gray-300 pb-3 animate-fade-down">
      <h1 class="text-3xl font-bold text-purple-dark">Dashboard</h1>
    </div>

    <!-- KPIs -->
    <div v-if="pendingStats" class="text-center p-10 bg-white rounded-xl shadow-lg animate-fade-up">
      <p class="text-lg font-semibold text-gray-500">Cargando estadísticas...</p>
    </div>
    <div
      v-else-if="statsError"
      class="text-center p-10 bg-red-50 rounded-xl shadow-lg border border-red-300 animate-fade-up"
    >
      <p class="text-lg font-semibold text-red-700">
        Error al cargar estadísticas: {{ statsError.message }}
      </p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-purple-deep text-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-kpi"
      >
        <font-awesome-icon
          icon="fas fa-dollar-sign"
          class="text-4xl text-bd-gold-accent opacity-70"
        />
        <div>
          <p class="text-sm uppercase tracking-wider text-purple-200">
            Pagos Pendientes
          </p>
          <p class="text-3xl font-extrabold">
            {{
              (stats.pendingPayments ?? 0).toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP'
              })
            }}
          </p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-kpi">
        <font-awesome-icon icon="fas fa-clock" class="text-4xl text-yellow-500 opacity-70" />
        <div>
          <p class="text-sm uppercase tracking-wider text-gray-500">
            Servicios "En Proceso"
          </p>
          <p class="text-3xl font-extrabold text-purple-dark">
            {{ stats.pendingServices ?? 0 }}
          </p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-kpi">
        <font-awesome-icon icon="fas fa-boxes" class="text-4xl text-red-500 opacity-70" />
        <div>
          <p class="text-sm uppercase tracking-wider text-gray-500">
            Urnas con Bajo Stock (&lt;5)
          </p>
          <p class="text-3xl font-extrabold text-purple-dark">
            {{ stats.lowStockItems ?? 0 }}
          </p>
        </div>
      </div>
    </div>

    <!-- Actividad reciente -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl animate-fade-up">
        <h3 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
          <font-awesome-icon icon="fas fa-bell" class="mr-2 text-purple-deep" />
          Actividad Reciente
        </h3>

        <div v-if="pendingActivity" class="text-center py-10 text-gray-500">
          Cargando actividad...
        </div>
        <div
          v-else-if="activityError"
          class="text-center py-10 text-red-600 bg-red-50 rounded-lg"
        >
          Error: {{ activityError.message }}
        </div>
        <div
          v-else-if="!activityData || activityData.length === 0"
          class="text-center py-10 text-gray-500"
        >
          <font-awesome-icon
            icon="fas fa-check-circle"
            class="text-4xl text-green-500 mb-3"
          />
          <p class="font-semibold">Sin registros aún</p>
          <p>No hay reservas registradas todavía.</p>
        </div>
        <div v-else class="space-y-4">
          <NuxtLink
            v-for="reserva in activityData"
            :key="reserva.id_reserva"
            :to="`/admin/editar-reserva?id=${reserva.id_reserva}`"
            class="block p-4 rounded-lg hover:bg-purple-card transition duration-150 border-l-4 border-yellow-500 bg-white-subtle shadow-sm animate-list-item"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-purple-dark">{{ reserva.servicio }}</p>
                <p class="text-sm text-gray-700">
                  Cliente:
                  <span class="font-semibold">{{ reserva.cliente }}</span>
                </p>
              </div>
              <div class="text-right flex-shrink-0 ml-4">
                <p class="font-bold text-dark-primary-blue text-lg">
                  {{
                    reserva.monto.toLocaleString('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    })
                  }}
                </p>
                <p class="text-sm text-gray-500">{{ reserva.fecha }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Atajos -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-2xl animate-fade-up-delayed">
          <h3 class="text-2xl font-bold text-purple-dark mb-4">
            <font-awesome-icon icon="fas fa-rocket" class="mr-2" />
            Atajos Rápidos
          </h3>
          <div class="space-y-3">
            <a
              href="#gestion-reservas"
              class="shortcut-link bg-purple-deep hover:bg-purple-light"
            >
              <font-awesome-icon icon="fas fa-book" class="mr-3" />
              Gestionar Reservas
            </a>
            <NuxtLink
              to="/admin/inventario"
              class="shortcut-link bg-purple-dark hover:bg-purple-light"
            >
              <font-awesome-icon icon="fas fa-boxes" class="mr-3" />
              Gestionar Inventario
            </NuxtLink>
            <NuxtLink
              to="/admin/gestionar-usuario"
              class="shortcut-link bg-purple-dark hover:bg-purple-light"
            >
              <font-awesome-icon icon="fas fa-users" class="mr-3" />
              Gestionar Usuarios
            </NuxtLink>
            <NuxtLink
              to="/admin/reportes"
              class="shortcut-link bg-bd-gold-accent text-purple-dark hover:bg-yellow-400"
            >
              <font-awesome-icon icon="fas fa-chart-line" class="mr-3" />
              Ver Reportes
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Gestión de reservas -->
    <div id="gestion-reservas" class="mt-12">
      <div
        class="flex flex-wrap justify-between items-center mb-8 border-b-2 border-gray-300 pb-3 gap-4 animate-fade-down"
      >
        <h1 class="text-3xl font-bold text-purple-dark">Gestión de Reservas</h1>

        <div class="flex space-x-3 items-center">
          <label
            for="statusFilter"
            class="text-sm font-semibold text-dark-primary-blue"
          >
            Filtrar por Estado (Pago):
          </label>
          <select
            v-model="filterStatus"
            id="statusFilter"
            class="p-2 border border-gray-300 rounded-lg focus:border-purple-deep focus:ring-1 focus:ring-purple-deep"
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-2xl p-4 animate-fade-up">
        <div v-if="pendingReservations" class="text-center py-10 text-gray-500">
          Cargando reservas...
        </div>
        <div
          v-else-if="errorReservations"
          class="text-center py-10 text-red-600 bg-red-50 rounded-lg"
        >
          Error al cargar las reservas: {{ errorReservations.message }}
        </div>

        <!-- Dos tablas: solo productos / servicios -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- SOLO PRODUCTOS -->
          <div class="animate-fade-up">
            <h2 class="text-lg font-bold text-dark-primary-blue mb-3">
              Pedidos Solo Productos
            </h2>
            <div class="border rounded-lg overflow-hidden">
              <table
                v-if="reservasSoloProductosPaginadas.length > 0"
                class="min-w-full divide-y divide-gray-200"
              >
                <thead class="bg-purple-dark text-white">
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    >
                      Cód. Trazabilidad
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      class="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      class="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider"
                    >
                      Monto
                    </th>
                    <th
                      class="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="reserva in reservasSoloProductosPaginadas"
                    :key="reserva.id_pedido"
                    class="hover:bg-purple-card transition duration-150"
                  >
                    <td
                      class="px-4 py-3 whitespace-nowrap text-sm font-mono text-purple-deep"
                    >
                      {{ reserva.cod_trazabilidad }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="text-sm font-semibold text-purple-dark">
                        {{ reserva.cliente }}
                      </p>
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700"
                    >
                      {{ reserva.estadoReserva }}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-dark-primary-blue"
                    >
                      {{
                        reserva.monto.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        })
                      }}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2"
                    >
                      <button
                        @click="editReserva(reserva.id_pedido)"
                        class="text-purple-deep hover:text-purple-light p-1 rounded-full transition duration-150"
                        title="Editar"
                      >
                        <font-awesome-icon icon="fas fa-pencil-alt" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="text-center py-6 text-gray-500 text-sm">
                No hay pedidos solo productos con este filtro.
              </div>

              <!-- Paginación Solo Productos -->
              <div
                v-if="totalPagesSoloProductos > 1"
                class="flex justify-center items-center gap-3 py-3 border-t bg-gray-50 text-xs"
              >
                <button
                  class="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="pageSoloProductos === 1"
                  @click="pageSoloProductos--"
                >
                  Anterior
                </button>
                <span>
                  Página {{ pageSoloProductos }} de {{ totalPagesSoloProductos }}
                </span>
                <button
                  class="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="pageSoloProductos === totalPagesSoloProductos"
                  @click="pageSoloProductos++"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          <!-- SERVICIOS (con o sin productos) -->
          <div class="animate-fade-up-delayed">
            <h2 class="text-lg font-bold text-dark-primary-blue mb-3">
              Reservas de Servicio
            </h2>
            <div class="border rounded-lg overflow-hidden">
              <table
                v-if="reservasServiciosPaginadas.length > 0"
                class="min-w-full divide-y divide-gray-200"
              >
                <thead class="bg-purple-dark text-white">
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    >
                      Cód. Trazabilidad
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    >
                      Mascota
                    </th>
                    <th
                      class="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider"
                    >
                      Estado Reserva
                    </th>
                    <th
                      class="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider"
                    >
                      Monto
                    </th>
                    <th
                      class="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="reserva in reservasServiciosPaginadas"
                    :key="reserva.id_pedido"
                    class="hover:bg-purple-card transition duration-150"
                  >
                    <td
                      class="px-4 py-3 whitespace-nowrap text-sm font-mono text-purple-deep"
                    >
                      {{ reserva.cod_trazabilidad }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="text-sm font-semibold text-purple-dark">
                        {{ reserva.cliente }}
                      </p>
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                    >
                      {{ reserva.petName || 'N/A' }}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700"
                    >
                      {{ reserva.estadoReserva }}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-dark-primary-blue"
                    >
                      {{
                        reserva.monto.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        })
                      }}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2"
                    >
                      <button
                        @click="editReserva(reserva.id_pedido)"
                        class="text-purple-deep hover:text-purple-light p-1 rounded-full transition duration-150"
                        title="Editar"
                      >
                        <font-awesome-icon icon="fas fa-pencil-alt" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="text-center py-6 text-gray-500 text-sm">
                No hay reservas de servicio con este filtro.
              </div>

              <!-- Paginación Servicios -->
              <div
                v-if="totalPagesServicios > 1"
                class="flex justify-center items-center gap-3 py-3 border-t bg-gray-50 text-xs"
              >
                <button
                  class="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="pageServicios === 1"
                  @click="pageServicios--"
                >
                  Anterior
                </button>
                <span>
                  Página {{ pageServicios }} de {{ totalPagesServicios }}
                </span>
                <button
                  class="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="pageServicios === totalPagesServicios"
                  @click="pageServicios++"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faDollarSign,
  faClock,
  faUserPlus,
  faBell,
  faCheckCircle,
  faRocket,
  faBook,
  faBoxes,
  faUsers,
  faChartLine,
  faEye,
  faPencilAlt,
  faTrash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faDollarSign,
  faClock,
  faUserPlus,
  faBell,
  faCheckCircle,
  faRocket,
  faBook,
  faBoxes,
  faUsers,
  faChartLine,
  faEye,
  faPencilAlt,
  faTrash,
  faSpinner
);

definePageMeta({
  middleware: 'auth'
});

const router = useRouter();

// Lógica de eliminación (por si vuelves a mostrar botón de borrar)
const deletingIds = ref<Set<number>>(new Set());
const isDeleting = (id: number) => deletingIds.value.has(id);

const handleDelete = async (idReserva: number) => {
  if (
    !confirm(
      `¿Estás seguro de que deseas eliminar la reserva #${idReserva}? Esta acción es irreversible.`
    )
  ) {
    return;
  }

  deletingIds.value.add(idReserva);

  try {
    const response = await $fetch(`/api/admin/eliminar-reserva`, {
      method: 'DELETE',
      query: { id: idReserva }
    });

    alert((response as { message: string }).message);
    await refresh();
  } catch (e: any) {
    console.error('Error al eliminar:', e);
    const errorMessage =
      e.data?.statusMessage || 'Fallo al eliminar la reserva. Verifique la conexión.';
    alert(errorMessage);
  } finally {
    deletingIds.value.delete(idReserva);
  }
};

// KPIs
interface DashboardStats {
  pendingServices: number;
  pendingPayments: number;
  lowStockItems: number;
}
const {
  data: stats,
  pending: pendingStats,
  error: statsError
} = await useAsyncData<DashboardStats>(
  'dashboard-stats',
  () => $fetch('/api/admin/dashboard-stats'),
  {
    default: () => ({
      pendingServices: 0,
      pendingPayments: 0,
      lowStockItems: 0
    })
  }
);

// Actividad reciente
interface RecentActivity {
  id_reserva: number;
  cliente: string;
  servicio: string;
  monto: number;
  fecha: string;
}
const {
  data: activityData,
  pending: pendingActivity,
  error: activityError
} = await useAsyncData<RecentActivity[]>(
  'dashboard-activity',
  () => $fetch('/api/admin/dashboard-activity'),
  {
    default: () => []
  }
);

// TABLA DE RESERVAS
const filterStatus = ref('Todos');

interface Reserva {
  id_pedido: number;
  cliente: string;
  nombreServicio: string;
  cod_trazabilidad: string | null;
  estadoPedido: 'Pendiente' | 'Pagado' | 'Cancelado' | string;
  estadoReserva: string;
  monto: number;
  petName?: string;
  es_reserva?: boolean; // ⚠️ ahora opcional, para que no se rompa si el backend no lo manda
}

const apiUrl = '/api/admin/reservas';

const {
  data: responseData,
  pending: pendingReservations,
  error: errorReservations,
  refresh
} = await useAsyncData<{ pedidos: Reserva[]; total: number }>(
  'lista-reservas',
  () =>
    $fetch(apiUrl, {
      params: { status: filterStatus.value }
    }),
  {
    default: () => ({ pedidos: [], total: 0 }),
    watch: [filterStatus]
  }
);

const reservations = computed(() => responseData.value?.pedidos || []);

// --- SEPARAR EN DOS GRUPOS ---
// Si el backend envía es_reserva, se usa. Si no, se cae al plan B: estadoReserva !== 'N/A' => es reserva.
const esReserva = (r: Reserva): boolean => {
  if (typeof r.es_reserva === 'boolean') return r.es_reserva;
  // fallback basado en los datos que ya tienes en reservas.get.ts
  return r.estadoReserva !== 'N/A';
};

const reservasSoloProductos = computed(() =>
  reservations.value.filter((r) => !esReserva(r))
);
const reservasServicios = computed(() =>
  reservations.value.filter((r) => esReserva(r))
);

// --- PAGINACIÓN LOCAL (10 por página para cada tabla) ---
const pageSize = 10;

const pageSoloProductos = ref(1);
const pageServicios = ref(1);

const totalPagesSoloProductos = computed(() =>
  Math.max(1, Math.ceil(reservasSoloProductos.value.length / pageSize))
);
const totalPagesServicios = computed(() =>
  Math.max(1, Math.ceil(reservasServicios.value.length / pageSize))
);

const reservasSoloProductosPaginadas = computed(() => {
  const start = (pageSoloProductos.value - 1) * pageSize;
  return reservasSoloProductos.value.slice(start, start + pageSize);
});

const reservasServiciosPaginadas = computed(() => {
  const start = (pageServicios.value - 1) * pageSize;
  return reservasServicios.value.slice(start, start + pageSize);
});

// Resetear página cuando cambia filtro
watch(filterStatus, () => {
  pageSoloProductos.value = 1;
  pageServicios.value = 1;
});

// Navegar a editar
const editReserva = (id: number) => {
  router.push(`/admin/editar-reserva?id=${id}`);
};
</script>

<style scoped lang="postcss">
.shortcut-link {
  @apply block w-full text-left text-white py-3 px-4 rounded-lg font-bold transition duration-150 shadow-md transform hover:scale-105;
}

/* COLORES */
.text-purple-dark {
  color: #4a235a;
}
.bg-purple-dark {
  background-color: #4a235a;
}
.text-purple-deep {
  color: #5c27a0;
}
.bg-purple-deep {
  background-color: #5c2a72;
}
.bg-purple-light {
  background-color: #6c3483;
}
.text-bd-gold-accent {
  color: #ffd700;
}
.bg-bd-gold-accent {
  background-color: #ffc107;
}
.hover\:bg-yellow-400:hover {
  background-color: #ffd700;
}
.bg-red-50 {
  background-color: #fef2f2;
}
.text-red-700 {
  color: #b91c1c;
}
.border-red-300 {
  border-color: #fca5a5;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-700 {
  color: #374151;
}
.text-dark-primary-blue {
  color: #34495e;
}
.text-green-500 {
  color: #22c55e;
}
.text-yellow-500 {
  color: #f59e0b;
}
.text-red-500 {
  color: #ef4444;
}
.bg-purple-card {
  background-color: #fcfaff;
}
.bg-white-subtle {
  background-color: #f8f4fa;
}
.border-yellow-500 {
  border-color: #f59e0b;
}
.focus\:border-purple-deep:focus {
  border-color: #5c2a72;
}
.focus\:ring-purple-deep:focus {
  --tw-ring-color: #5c2a72;
}
.bg-yellow-100 {
  background-color: #fff3cd;
}
.text-yellow-800 {
  color: #856404;
}
.bg-blue-100 {
  background-color: #d1ecf1;
}
.text-blue-800 {
  color: #0c5460;
}
.bg-green-100 {
  background-color: #d4edda;
}
.text-green-800 {
  color: #155724;
}
.bg-red-100 {
  background-color: #f8d7da;
}
.text-red-800 {
  color: #721c24;
}
.text-red-600 {
  color: #dc2626;
}
.hover\:text-red-700:hover {
  color: #b91c1c;
}
.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

/* ANIMACIONES */

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-fade-in {
  animation: fade-in-up 0.4s ease-out;
}

.animate-fade-up {
  animation: fade-in-up 0.5s ease-out;
}
.animate-fade-up-delayed {
  animation: fade-in-up 0.6s ease-out;
}
.animate-fade-down {
  animation: fade-in-down 0.4s ease-out;
}
.animate-kpi {
  animation: fade-in-up 0.5s ease-out;
}
.animate-list-item {
  animation: fade-in-up 0.4s ease-out;
}
</style>
