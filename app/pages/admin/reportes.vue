<template>
  <div class="pt-14 py-16 min-h-screen container mx-auto px-4 space-y-8 animate-page-fade">
    
    <div
      class="flex flex-col md:flex-row justify-between items-center pb-3 animate-fade-in-up"
    >
      <h1 class="text-3xl font-bold text-purple-dark mb-4 md:mb-0 flex items-center gap-2">
        <span class="inline-block h-3 w-3 rounded-full bg-green-400 animate-pulse-soft"></span>
        Dashboard de Reportes
      </h1>
      
      <div class="p-2 bg-white rounded-lg shadow-md flex justify-center space-x-1">
        <button
          @click="period = 'month'"
          :class="period === 'month'
            ? 'bg-purple-deep text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-lg font-bold transition duration-150 text-sm transform hover:-translate-y-0.5"
        >
          Mes Actual
        </button>
        <button
          @click="period = 'quarter'"
          :class="period === 'quarter'
            ? 'bg-purple-deep text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-lg font-bold transition duration-150 text-sm transform hover:-translate-y-0.5"
        >
          Trimestre Actual
        </button>
        <button
          @click="period = 'year'"
          :class="period === 'year'
            ? 'bg-purple-deep text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-lg font-bold transition duration-150 text-sm transform hover:-translate-y-0.5"
        >
          Año Actual
        </button>
      </div>
    </div>

    <p class="text-gray-600 -mt-6 animate-fade-in-up">
      Mostrando datos para:
      <span class="font-semibold text-purple-deep">{{ periodTitle }}</span>
    </p>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-purple-deep text-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-fade-in-up"
      >
        <font-awesome-icon
          icon="fas fa-dollar-sign"
          class="text-4xl text-bd-gold-accent opacity-70"
        />
        <div>
          <p class="text-sm uppercase tracking-wider text-purple-200">
            Total de Ingresos (Neto)
          </p>
          <p v-if="salesPending" class="text-3xl font-extrabold animate-pulse-soft">
            Cargando...
          </p>
          <p v-else class="text-3xl font-extrabold">
            {{ totalIngresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}
          </p>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-fade-in-up"
      >
        <font-awesome-icon
          icon="fas fa-check-circle"
          class="text-4xl text-green-500 opacity-70"
        />
        <div>
          <p class="text-sm uppercase tracking-wider text-gray-500">
            Pedidos Pagados
          </p>
          <p
            v-if="transaccionesPending"
            class="text-3xl font-extrabold text-purple-dark animate-pulse-soft"
          >
            Cargando...
          </p>
          <p v-else class="text-3xl font-extrabold text-purple-dark">
            {{ totalPedidosPagados }}
          </p>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4 animate-fade-in-up"
      >
        <font-awesome-icon
          icon="fas fa-box"
          class="text-4xl text-purple-dark opacity-70"
        />
        <div>
          <p class="text-sm uppercase tracking-wider text-gray-500">
            Productos Vendidos (Urnas + Serv. + Acc.)
          </p>
          <p
            v-if="urnasPending || serviciosPending || accesoriosPending"
            class="text-3xl font-extrabold text-purple-dark animate-pulse-soft"
          >
            Cargando...
          </p>
          <p v-else class="text-3xl font-extrabold text-purple-dark">
            {{ totalProductosVendidos }}
          </p>
        </div>
      </div>
    </div>

    <!-- Gráfico de ventas -->
    <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-12 animate-scale-in">
      <div class="h-96">
        <VentasChart
          v-if="salesData && salesData.data.length > 0"
          :chartData="salesChartData"
        />
        <p v-else class="text-center text-gray-500 pt-16">
          No hay datos de ventas para el período seleccionado.
        </p>
      </div>
    </div>

    <!-- Top vendidos -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Urnas -->
      <div class="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-purple-dark flex items-center gap-2">
            <font-awesome-icon
              icon="fas fa-box-open"
              class="text-bd-gold-accent"
            />
            Urnas Más Vendidas
          </h2>
        </div>
        <div v-if="urnasPending" class="text-center py-10 text-gray-500">
          Calculando...
        </div>
        <div
          v-else-if="urnasError"
          class="text-center py-10 text-red-600 bg-red-50"
        >
          Error: {{ urnasError.message }}
        </div>
        <div v-else>
          <table
            v-if="urnasData && urnasData.length > 0"
            class="min-w-full divide-y divide-gray-200"
          >
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-bold uppercase text-purple-dark tracking-wider w-8/12"
                >
                  Nombre
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-bold uppercase text-purple-dark tracking-wider w-4/12"
                >
                  Ventas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="urna in urnasData"
                :key="urna.nombre"
                class="hover:bg-purple-card transition duration-150 transform hover:-translate-y-0.5"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-primary-blue"
                >
                  {{ urna.nombre }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700"
                >
                  {{ urna.ventas }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center text-gray-500 py-10">
            No se vendieron urnas en este período.
          </p>
        </div>
      </div>

      <!-- Accesorios -->
      <div class="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-purple-dark flex items-center gap-2">
            <font-awesome-icon
              icon="fas fa-puzzle-piece"
              class="text-blue-500"
            />
            Accesorios Más Vendidos
          </h2>
        </div>
        <div v-if="accesoriosPending" class="text-center py-10 text-gray-500">
          Calculando...
        </div>
        <div
          v-else-if="accesoriosError"
          class="text-center py-10 text-red-600 bg-red-50"
        >
          Error: {{ accesoriosError.message }}
        </div>
        <div v-else>
          <table
            v-if="accesoriosData && accesoriosData.length > 0"
            class="min-w-full divide-y divide-gray-200"
          >
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 tracking-wider w-8/12"
                >
                  Nombre
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-bold uppercase text-gray-500 tracking-wider w-4/12"
                >
                  Ventas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="accesorio in accesoriosData"
                :key="accesorio.nombre"
                class="hover:bg-purple-card transition duration-150 transform hover:-translate-y-0.5"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-primary-blue"
                >
                  {{ accesorio.nombre }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700"
                >
                  {{ accesorio.ventas }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center text-gray-500 py-10">
            No se vendieron accesorios en este período.
          </p>
        </div>
      </div>

      <!-- Servicios -->
      <div class="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-purple-dark flex items-center gap-2">
            <font-awesome-icon
              icon="fas fa-heart"
              class="text-red-500"
            />
            Servicios Más Vendidos
          </h2>
        </div>
        <div v-if="serviciosPending" class="text-center py-10 text-gray-500">
          Calculando...
        </div>
        <div
          v-else-if="serviciosError"
          class="text-center py-10 text-red-600 bg-red-50"
        >
          Error: {{ serviciosError.message }}
        </div>
        <div v-else>
          <table
            v-if="serviciosData && serviciosData.length > 0"
            class="min-w-full divide-y divide-gray-200"
          >
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-bold uppercase text-purple-dark tracking-wider w-8/12"
                >
                  Nombre
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-bold uppercase text-purple-dark tracking-wider w-4/12"
                >
                  Ventas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="servicio in serviciosData"
                :key="servicio.nombre"
                class="hover:bg-purple-card transition duration-150 transform hover:-translate-y-0.5"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-primary-blue"
                >
                  {{ servicio.nombre }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700"
                >
                  {{ servicio.ventas }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center text-gray-500 py-10">
            No se vendieron servicios en este período.
          </p>
        </div>
      </div>
    </div> 
    
    <!-- Transacciones recientes -->
    <div class="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-purple-dark flex items-center gap-2">
          <font-awesome-icon
            icon="fas fa-receipt"
            class="text-gray-500"
          />
          Últimas Transacciones (Pagadas)
        </h2>
        <p class="text-gray-600">
          Mostrando datos para:
          <span class="font-semibold text-purple-deep">{{ periodTitle }}</span>
        </p>
      </div>
      
      <div
        v-if="transaccionesPending"
        class="text-center py-10 text-gray-500"
      >
        Cargando transacciones...
      </div>
      <div
        v-else-if="transaccionesError"
        class="text-center py-10 text-red-600 bg-red-50"
      >
        Error al cargar las transacciones: {{ transaccionesError.message }}
      </div>
      <div v-else>
        <table
          v-if="transaccionesData && transaccionesData.length > 0"
          class="min-w-full divide-y divide-gray-200"
        >
          <thead class="bg-purple-dark text-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                ID Pago
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Método
              </th>
              <th class="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">
                Monto
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="tx in transaccionesData"
              :key="tx.id"
              class="hover:bg-purple-card transition duration-150 transform hover:-translate-y-0.5"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-primary-blue"
              >
                {{ tx.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {{ tx.fecha }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-dark"
              >
                {{ tx.cliente }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {{ tx.metodo }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700"
              >
                {{
                  tx.monto.toLocaleString('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                  })
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-center text-gray-500 py-10">
          No se encontraron transacciones en el período seleccionado.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ChartData } from 'chart.js';
import VentasChart from '../../../components/VentasChart.vue'; 
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faChartLine, faBoxOpen, faHeart, faReceipt, faPuzzlePiece, faDollarSign, 
  faCheckCircle, faBox, faClock, faUserPlus, faBell, faRocket, faBook, faBoxes, faUsers
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faChartLine, faBoxOpen, faHeart, faReceipt, faPuzzlePiece, faDollarSign, 
  faCheckCircle, faBox, faClock, faUserPlus, faBell, faRocket, faBook, faBoxes, faUsers
);

definePageMeta({
  middleware: 'auth'
});

// --- Tipado de las APIs ---
interface SalesData {
  labels: string[];
  data: number[];
  total: number;
}
interface TopProduct {
  nombre: string;
  ventas: number;
}
interface Transaccion {
  id: number;
  fecha: string;
  cliente: string;
  monto: number;
  metodo: string;
}

const period = ref<'month' | 'quarter' | 'year'>('month');

const periodTitle = computed(() => {
  if (period.value === 'year') return 'Este Año';
  if (period.value === 'quarter') return 'Este Trimestre';
  return 'Este Mes';
});

// --- Ventas (gráfico) ---
const { 
  data: salesData, 
  pending: salesPending, 
  error: salesError 
} = await useAsyncData<SalesData>(
  'reporte-ventas',
  () => $fetch('/api/admin/reporte-ventas', { query: { period: period.value } }),
  { watch: [period] }
);

// --- Urnas ---
const { 
  data: urnasData, 
  pending: urnasPending, 
  error: urnasError 
} = await useAsyncData<TopProduct[]>(
  'reporte-urnas',
  () => $fetch('/api/admin/reporte-urnas', { query: { period: period.value } }),
  { watch: [period], default: () => [] }
);

// --- Servicios ---
const { 
  data: serviciosData, 
  pending: serviciosPending, 
  error: serviciosError 
} = await useAsyncData<TopProduct[]>(
  'reporte-servicios',
  () => $fetch('/api/admin/reporte-servicios', { query: { period: period.value } }),
  { watch: [period], default: () => [] }
);

// --- Accesorios ---
const { 
  data: accesoriosData, 
  pending: accesoriosPending, 
  error: accesoriosError 
} = await useAsyncData<TopProduct[]>(
  'reporte-accesorios',
  () => $fetch('/api/admin/reporte-accesorios', { query: { period: period.value } }),
  { watch: [period], default: () => [] }
);

// --- Transacciones ---
const { 
  data: transaccionesData, 
  pending: transaccionesPending, 
  error: transaccionesError 
} = await useAsyncData<Transaccion[]>(
  'transacciones-recientes',
  () => $fetch('/api/admin/transacciones-recientes', { query: { period: period.value } }),
  { watch: [period], default: () => [] }
);

// --- Datos para el gráfico ---
const salesChartData = computed((): ChartData<'line'> => {
  const data = salesData.value;
  return {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Ingresos (CLP)',
        backgroundColor: '#6C3483',
        borderColor: '#4A235A',
        data: data?.data || [],
        fill: true,
        tension: 0.1
      }
    ]
  };
});

// KPIs
const totalIngresos = computed(() => salesData.value?.total ?? 0);
const totalPedidosPagados = computed(() => transaccionesData.value?.length ?? 0);

const totalProductosVendidos = computed(() => {
  const urnas = urnasData.value?.reduce((sum, item) => sum + item.ventas, 0) ?? 0;
  const servicios = serviciosData.value?.reduce((sum, item) => sum + item.ventas, 0) ?? 0;
  const accesorios = accesoriosData.value?.reduce((sum, item) => sum + item.ventas, 0) ?? 0;
  return urnas + servicios + accesorios;
});
</script>

<style scoped>
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.text-purple-200 { color: #e9d5ff; }
.text-dark-primary-blue { color: #34495e; }
.bg-red-50 { background-color: #fef2f2; }
.hover\:bg-purple-card:hover { background-color: #fcfaff; }
.text-bd-gold-accent { color: #FFD700; }
.text-red-500 { color: #EF4444; }
.text-green-500 { color: #22c55e; }
.text-blue-500 { color: #3b82f6; }

/* Animaciones */
@keyframes page-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Helpers */
.animate-page-fade {
  animation: page-fade 0.25s ease-out;
}
.animate-fade-in-up {
  animation: fade-in-up 0.35s ease-out;
}
.animate-scale-in {
  animation: scale-in 0.35s ease-out;
}
.animate-pulse-soft {
  animation: pulse-soft 1.1s ease-in-out infinite;
}
</style>
