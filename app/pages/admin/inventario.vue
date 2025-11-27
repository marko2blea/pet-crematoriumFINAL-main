<!-- app/pages/admin/inventario.vue -->
<template>
  <div class="pt-14 py-10 px-4 min-h-screen bg-gray-50">
    <div class="container mx-auto max-w-7xl">

      <!-- Header -->
      <div
        class="flex justify-between items-center mb-6 border-b pb-3 animate-fade-in-up"
      >
        <h1 class="text-3xl font-bold text-purple-dark flex items-center space-x-2">
          <span>Inventario de Productos y Servicios</span>
        </h1>

        <button
          @click="agregarProducto"
          class="bg-purple-deep text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-light transition transform hover:-translate-y-0.5 hover:shadow-lg shadow-md flex items-center"
        >
          <font-awesome-icon icon="fas fa-plus" class="mr-2" />
          Añadir Ítem
        </button>
      </div>

      <!-- Estados globales -->
      <div v-if="pending" class="text-center py-20 text-gray-600 animate-fade-in-up">
        Cargando inventario...
      </div>

      <div
        v-else-if="isError"
        class="text-center py-10 bg-red-50 rounded-xl shadow-lg border border-red-300 animate-fade-in-up"
      >
        <p class="text-red-700 text-lg font-semibold">{{ feedbackMessage }}</p>
      </div>

      <div v-else class="space-y-10 animate-fade-in-up">

        <!-- SECCIÓN SERVICIOS -->
        <section>
          <h2
            class="text-2xl font-bold text-purple-deep mt-4 mb-4 flex items-center space-x-2 animate-slide-in-left"
          >
            <font-awesome-icon icon="fas fa-heart" class="text-purple-deep" />
            <span>Servicios Activos ({{ servicios.length }})</span>
          </h2>

          <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4 transform transition hover:-translate-y-0.5 hover:shadow-3xl">
            <table class="w-full">
              <thead class="bg-purple-deep text-white">
                <tr>
                  <th class="py-3 px-4 text-left w-2/5">Nombre</th>
                  <th class="py-3 px-4 text-left">Tipo</th>
                  <th class="py-3 px-4 text-left">Precio</th>
                  <th class="py-3 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in serviciosPaginados"
                  :key="p.id"
                  class="border-b last:border-b-0 hover:bg-gray-50 transition duration-150 animate-row-fade-in"
                >
                  <td class="py-3 px-4 font-semibold text-gray-800">
                    {{ p.nombre }}
                  </td>
                  <td class="py-3 px-4">
                    <span :class="getTypeBadgeClass(p.tipo)">{{ p.tipo }}</span>
                  </td>
                  <td class="py-3 px-4 font-extrabold text-purple-dark">
                    {{ p.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}
                  </td>
                  <td class="py-3 px-4 space-x-2">
                    <button
                      @click="editarProducto(p.id)"
                      class="bg-purple-deep text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-light transition transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Editar
                    </button>
                    <button
                      @click="eliminarProducto(p.id)"
                      class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>

                <tr v-if="servicios.length === 0">
                  <td colspan="4" class="text-center py-6 text-gray-500">
                    No hay servicios disponibles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación SOLO para Servicios (10 por página) -->
          <div
            v-if="totalServicesPages > 1"
            class="flex justify-center mt-4 space-x-4 animate-fade-in-up"
          >
            <button
              @click="cambiarPaginaServicios(currentServicesPage - 1)"
              :disabled="currentServicesPage === 1"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <span class="px-4 py-2 bg-gray-100 rounded-lg">
              Página {{ currentServicesPage }} de {{ totalServicesPages }}
            </span>
            <button
              @click="cambiarPaginaServicios(currentServicesPage + 1)"
              :disabled="currentServicesPage >= totalServicesPages"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </section>

        <!-- SECCIÓN PRODUCTOS FÍSICOS (Urnas y Accesorios) -->
        <section>
          <h2
            class="text-2xl font-bold text-purple-deep mb-4 flex items-center space-x-2 animate-slide-in-right"
          >
            <font-awesome-icon icon="fas fa-box" class="text-purple-deep" />
            <span>Productos ({{ productos.length }})</span>
          </h2>

          <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4 transform transition hover:-translate-y-0.5 hover:shadow-3xl">
            <table class="w-full">
              <thead class="bg-purple-deep text-white">
                <tr>
                  <th class="py-3 px-4 text-left w-2/5">Nombre</th>
                  <th class="py-3 px-4 text-left">Tipo</th>
                  <th class="py-3 px-4 text-left">Stock</th>
                  <th class="py-3 px-4 text-left">Precio</th>
                  <th class="py-3 px-4 text-left">Disponible</th>
                  <th class="py-3 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in productos"
                  :key="p.id"
                  class="border-b last:border-b-0 hover:bg-gray-50 transition duration-150 animate-row-fade-in"
                >
                  <td class="py-3 px-4 font-semibold text-gray-800">
                    {{ p.nombre }}
                  </td>
                  <td class="py-3 px-4">
                    <span :class="getTypeBadgeClass(p.tipo)">{{ p.tipo }}</span>
                  </td>
                  <td
                    class="py-3 px-4 font-semibold"
                    :class="p.stock < 5 ? 'text-red-600' : 'text-gray-700'"
                  >
                    {{ p.stock }}
                  </td>
                  <td class="py-3 px-4">
                    {{ p.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}
                  </td>
                  <td
                    class="py-3 px-4 text-sm font-semibold"
                    :class="p.disponible ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ p.disponible ? 'Sí' : 'No' }}
                  </td>
                  <td class="py-3 px-4 space-x-2">
                    <button
                      @click="editarProducto(p.id)"
                      class="bg-purple-deep text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-light transition transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Editar
                    </button>
                    <button
                      @click="eliminarProducto(p.id)"
                      class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="productos.length === 0">
                  <td colspan="6" class="text-center py-6 text-gray-500">
                    No hay productos físicos disponibles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación general del endpoint (si la sigues usando) -->
          <div class="flex justify-center mt-6 space-x-4 animate-fade-in-up">
            <button
              @click="currentPage > 1 && cambiarPagina(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <span class="px-4 py-2 bg-gray-100 rounded-lg">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              @click="currentPage < totalPages && cambiarPagina(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faHeart, faBox } from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faHeart, faBox);

definePageMeta({
  middleware: 'admin'
});

// Interfaz para la tabla
interface ProductoInventario {
  id: number;       // cod_producto en el backend mapeado a id
  nombre: string;   // nombre_producto
  tipo: string;     // tipo_producto
  stock: number;
  precio: number;
  disponible: boolean;
}

// Estados reactivos
const allProducts = ref<ProductoInventario[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const itemsPerPage = 10; // Paginación del endpoint

const feedbackMessage = ref('');
const isError = ref(false);
const pending = ref(false);

const router = useRouter();

const totalPages = computed(() =>
  totalCount.value > 0 ? Math.ceil(totalCount.value / itemsPerPage) : 1
);

// Servicios y productos (filtros)
const servicios = computed(() =>
  allProducts.value.filter((p) => p.tipo === 'Servicio')
);
const productos = computed(() =>
  allProducts.value.filter((p) => p.tipo !== 'Servicio')
);

// 🔟 Paginación SOLO para servicios (10 por página)
const servicesPerPage = 10;
const currentServicesPage = ref(1);

const totalServicesPages = computed(() =>
  servicios.value.length > 0
    ? Math.ceil(servicios.value.length / servicesPerPage)
    : 1
);

const serviciosPaginados = computed(() => {
  const start = (currentServicesPage.value - 1) * servicesPerPage;
  const end = start + servicesPerPage;
  return servicios.value.slice(start, end);
});

// Ajustar página de servicios si cambia el listado
watch(servicios, () => {
  if (currentServicesPage.value > totalServicesPages.value) {
    currentServicesPage.value = 1;
  }
});

const fetchProducto = async () => {
  pending.value = true;
  isError.value = false;
  try {
    const res = await $fetch<{ producto: ProductoInventario[]; totalCount: number }>(
      '/api/admin/inventario',
      {
        query: { page: currentPage.value, perPage: itemsPerPage }
      }
    );
    allProducts.value = res.producto || [];
    totalCount.value = res.totalCount || 0;
  } catch (err: any) {
    isError.value = true;
    feedbackMessage.value =
      err?.data?.statusMessage || 'Error al cargar inventario';
    allProducts.value = [];
    totalCount.value = 0;
  } finally {
    pending.value = false;
  }
};

const editarProducto = (id: number) => {
  router.push(`/admin/editar-producto?id=${id}`);
};

const eliminarProducto = async (id: number) => {
  if (!confirm('¿Deseas eliminar este producto?')) return;
  try {
    await $fetch(`/api/admin/eliminar-producto`, {
      method: 'DELETE',
      body: { id }
    });
    fetchProducto();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Error al eliminar producto');
  }
};

const agregarProducto = () => {
  router.push('/admin/agregar-producto');
};

// Paginación general (endpoint)
const cambiarPagina = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

onMounted(() => {
  fetchProducto();
});

watch(currentPage, () => {
  fetchProducto();
});

// FUNCIÓN PARA ASIGNAR CLASES DE TIPO (COLOR)
const getTypeBadgeClass = (tipo: string) => {
  switch (tipo) {
    case 'Servicio':
      return 'px-2 py-0.5 rounded-full bg-purple-200 text-purple-deep text-xs font-semibold';
    case 'Urna':
      return 'px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold';
    case 'Accesorio':
      return 'px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold';
    default:
      return 'px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold';
  }
};

// Paginación solo servicios
const cambiarPaginaServicios = (page: number) => {
  if (page < 1 || page > totalServicesPages.value) return;
  currentServicesPage.value = page;
};
</script>

<style scoped>
.text-purple-dark {
  color: #4a235a;
}
.bg-purple-dark {
  background-color: #4a235a;
}
.bg-purple-deep {
  background-color: #5c2a72;
}
.hover\:bg-purple-light:hover {
  background-color: #6c3483;
}
.bg-white-subtle {
  background-color: #f8f4fa;
}
.bg-red-500 {
  background-color: #ef4444;
}
.hover\:bg-red-600:hover {
  background-color: #dc2626;
}

/* Colores de Badges */
.bg-purple-200 {
  background-color: #d8b4fe;
}
.text-purple-deep {
  color: #5c2a72;
}
.bg-yellow-100 {
  background-color: #fff3cd;
}
.text-yellow-800 {
  color: #b45309;
}
.bg-blue-100 {
  background-color: #bfdbfe;
}
.text-blue-800 {
  color: #1e40af;
}
.text-red-600 {
  color: #dc2626;
}
.text-green-600 {
  color: #059669;
}

/* Estilos de tabla */
table {
  border-collapse: separate;
  border-spacing: 0;
}
th,
td {
  border-left: none !important;
}
th:first-child {
  border-top-left-radius: 0.5rem;
}
th:last-child {
  border-top-right-radius: 0.5rem;
}

/* Animaciones */
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
@keyframes slide-in-left {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slide-in-right {
  0% {
    opacity: 0;
    transform: translateX(10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes row-fade-in {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}
.animate-slide-in-left {
  animation: slide-in-left 0.4s ease-out;
}
.animate-slide-in-right {
  animation: slide-in-right 0.4s ease-out;
}
.animate-row-fade-in {
  animation: row-fade-in 0.25s ease-out;
}
</style>
