<template>
  <div class="pt-14 py-16 min-h-screen container mx-auto px-4 space-y-8">
    
    <div class="border-b-2 border-gray-300 pb-3">
        <h1 class="text-3xl font-bold text-purple-dark">Dashboard</h1>
    </div>

    <div v-if="pendingStats" class="text-center p-10 bg-white rounded-xl shadow-lg">
        <p class="text-lg font-semibold text-gray-500">Cargando estadísticas...</p>
    </div>
    <div v-else-if="statsError" class="text-center p-10 bg-red-50 rounded-xl shadow-lg border border-red-300">
        <p class="text-lg font-semibold text-red-700">Error al cargar estadísticas: {{ statsError.message }}</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-purple-deep text-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <font-awesome-icon icon="fas fa-dollar-sign" class="text-4xl text-bd-gold-accent opacity-70" />
            <div>
                <p class="text-sm uppercase tracking-wider text-purple-200">Pagos Pendientes</p>
                <p class="text-3xl font-extrabold">{{ (stats.pendingPayments ?? 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}</p>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <font-awesome-icon icon="fas fa-clock" class="text-4xl text-yellow-500 opacity-70" />
            <div>
                <p class="text-sm uppercase tracking-wider text-gray-500">Servicios "En Proceso"</p>
                <p class="text-3xl font-extrabold text-purple-dark">{{ stats.pendingServices ?? 0 }}</p>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <font-awesome-icon icon="fas fa-boxes" class="text-4xl text-red-500 opacity-70" />
            <div>
                <p class="text-sm uppercase tracking-wider text-gray-500">Urnas con Bajo Stock (&lt;5)</p>
                <p class="text-3xl font-extrabold text-purple-dark">{{ stats.lowStockItems ?? 0 }}</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl">
            <h3 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
                <font-awesome-icon icon="fas fa-bell" class="mr-2 text-purple-deep" />
                Actividad Reciente (Pendientes de Pago)
            </h3>
            
            <div v-if="pendingActivity" class="text-center py-10 text-gray-500">Cargando actividad...</div>
            <div v-else-if="activityError" class="text-center py-10 text-red-600 bg-red-50">Error: {{ activityError.message }}</div>
            <div v-else-if="!activityData || activityData.length === 0" class="text-center py-10 text-gray-500">
                <font-awesome-icon icon="fas fa-check-circle" class="text-4xl text-green-500 mb-3" />
                <p class="font-semibold">¡Todo al día!</p>
                <p>No hay reservas pendientes de pago.</p>
            </div>
            <div v-else class="space-y-4">
                <NuxtLink 
                  v-for="reserva in activityData" 
                  :key="reserva.id_reserva" 
                  :to="`/admin/editar-reserva?id=${reserva.id_reserva}`"
                  class="block p-4 rounded-lg hover:bg-purple-card transition duration-150 border-l-4 border-yellow-500 bg-white-subtle shadow-sm"
                >
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-purple-dark">{{ reserva.servicio }}</p>
                            <p class="text-sm text-gray-700">Cliente: <span class="font-semibold">{{ reserva.cliente }}</span></p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-4">
                            <p class="font-bold text-dark-primary-blue text-lg">{{ reserva.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}</p>
                            <p class="text-sm text-gray-500">{{ reserva.fecha }}</p>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>

        <div classs="space-y-6">
            <div class="bg-white p-6 rounded-xl shadow-2xl">
                <h3 class="text-2xl font-bold text-purple-dark mb-4">
                    <font-awesome-icon icon="fas fa-rocket" class="mr-2" />
                    Atajos Rápidos
                </h3>
                <div class="space-y-3">
                    <a href="#gestion-reservas" class="shortcut-link bg-purple-deep hover:bg-purple-light">
                        <font-awesome-icon icon="fas fa-book" class="mr-3" />
                        Gestionar Reservas
                    </a>
                    <NuxtLink to="/admin/inventario" class="shortcut-link bg-purple-dark hover:bg-purple-light">
                        <font-awesome-icon icon="fas fa-boxes" class="mr-3" />
                        Gestionar Inventario
                    </NuxtLink>
                    <NuxtLink to="/admin/gestionar-usuario" class="shortcut-link bg-purple-dark hover:bg-purple-light">
                        <font-awesome-icon icon="fas fa-users" class="mr-3" />
                        Gestionar Usuarios
                    </NuxtLink>
                    <NuxtLink to="/admin/reportes" class="shortcut-link bg-bd-gold-accent text-purple-dark hover:bg-yellow-400">
                        <font-awesome-icon icon="fas fa-chart-line" class="mr-3" />
                        Ver Reportes
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>

    <div id="gestion-reservas" class="mt-12">
      <div class="flex flex-wrap justify-between items-center mb-8 border-b-2 border-gray-300 pb-3 gap-4">
          <h1 class="text-3xl font-bold text-purple-dark">Gestión de Reservas</h1>
          
          <div class="flex space-x-3 items-center">
              <label for="statusFilter" class="text-sm font-semibold text-dark-primary-blue">Filtrar por Estado (Pago):</label>
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

      <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div v-if="pendingReservations" class="text-center py-10 text-gray-500">Cargando reservas...</div>
          <div v-else-if="errorReservations" class="text-center py-10 text-red-600 bg-red-50">
              Error al cargar las reservas: {{ errorReservations.message }}
          </div>
          
          <table v-else-if="reservations && reservations.length > 0" class="min-w-full divide-y divide-gray-200">
              <thead class="bg-purple-dark text-white">
                  <tr>
                      <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">ID Pedido</th>
                      <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Cliente</th>
                      <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Mascota</th>
                      <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Servicio</th>
                      <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Cód. Trazabilidad</th>
                      <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Estado Pago</th>
                      <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Estado Reserva</th>
                      <th class="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">Monto</th>
                      <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="reserva in reservations" :key="reserva.id" class="hover:bg-purple-card transition duration-150">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-primary-blue">{{ reserva.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                          <p class="text-sm font-semibold text-purple-dark">{{ reserva.clientName }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ reserva.petName }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ reserva.serviceName }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-deep">{{ reserva.trackingCode }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                :class="{
                                  'bg-yellow-100 text-yellow-800': reserva.status === 'Pendiente',
                                  'bg-green-100 text-green-800': reserva.status === 'Pagado',
                                  'bg-red-100 text-red-800': reserva.status === 'Cancelado'
                                }">
                              {{ reserva.status }}
                          </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                          {{ reserva.statusReserva }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-dark-primary-blue">
                          ${{ reserva.amount.toLocaleString('es-CL') }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button @click="editReserva(reserva.id)" class="text-purple-deep hover:text-purple-light p-1 rounded-full transition duration-150 ml-2" title="Editar Reserva">
                              <font-awesome-icon icon="fas fa-pencil-alt" />
                          </button>
                      </td>
                  </tr>
              </tbody>
          </table>
          <div v-else class="text-center py-10 text-gray-500">
              No se encontraron reservas que coincidan con el filtro.
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
    faDollarSign, faClock, faUserPlus, faBell, faCheckCircle, 
    faRocket, faBook, faBoxes, faUsers, faChartLine,
    faEye, faPencilAlt // (NUEVO) Iconos de reservas
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faDollarSign, faClock, faUserPlus, faBell, faCheckCircle,
    faRocket, faBook, faBoxes, faUsers, faChartLine,
    faEye, faPencilAlt // (NUEVO)
);

definePageMeta({
  middleware: 'auth'
});

const router = useRouter(); // (NUEVO) Router para la tabla de reservas

// --- Carga de Datos de KPIs (Dashboard) ---
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

// --- Carga de datos de "Actividad Reciente" (Dashboard) ---
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


// --- (NUEVO) Carga de Datos de la TABLA DE RESERVAS ---
const filterStatus = ref('Todos');

interface Reserva {
    id: number;
    clientName: string;
    petName: string;
    serviceName: string;
    trackingCode: string | null;
    status: 'Pendiente' | 'Pagado' | 'Cancelado';
    statusReserva: string;
    amount: number;
}

const apiUrl = '/api/admin/reservas';
const { 
  data: reservations, 
  pending: pendingReservations, 
  error: errorReservations,
} = await useAsyncData<Reserva[]>(
  'lista-reservas',
  () => $fetch(apiUrl, { 
    params: { status: filterStatus.value } 
  }),
  {
    default: () => [],
    watch: [filterStatus] // Recarga la tabla cuando el filtro cambia
  }
);

// --- (NUEVO) Funciones de la TABLA DE RESERVAS ---
const editReserva = (id: number) => {
    router.push(`/admin/editar-reserva?id=${id}`);
};

</script>

<style scoped lang="postcss">
/* (Estilos sin cambios) */
.shortcut-link {
    @apply block w-full text-left text-white py-3 px-4 rounded-lg font-bold transition duration-150 shadow-md;
}
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C27A0; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-bd-gold-accent { color: #FFD700; }
.bg-bd-gold-accent { background-color: #FFC107; }
.hover\:bg-yellow-400:hover { background-color: #FFD700; }
.bg-red-50 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }
.text-dark-primary-blue { color: #34495e; }
.text-green-500 { color: #22c55e; }
.text-yellow-500 { color: #f59e0b; }
.text-red-500 { color: #ef4444; }
.bg-purple-card { background-color: #fcfaff; }
.bg-white-subtle { background-color: #F8F4FA; }
.border-yellow-500 { border-color: #f59e0b; }

/* (NUEVO) Estilos de la tabla de reservas */
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.bg-yellow-100 { background-color: #fff3cd; }
.text-yellow-800 { color: #856404; }
.bg-blue-100 { background-color: #d1ecf1; }
.text-blue-800 { color: #0c5460; }
.bg-green-100 { background-color: #d4edda; }
.text-green-800 { color: #155724; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-800 { color: #721c24; }
</style>