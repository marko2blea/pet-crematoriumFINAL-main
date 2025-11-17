<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    
    <div class="flex justify-between items-center mb-8 border-b-2 border-gray-300 pb-3">
        <h1 class="text-3xl font-bold text-purple-dark">Gestión de Inventario</h1>
        <NuxtLink to="/admin/agregar-producto">
            <button class="bg-purple-deep text-white py-2 px-5 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-lg flex items-center space-x-2">
                <font-awesome-icon icon="fas fa-plus-circle" />
                <span>Añadir Producto</span>
            </button>
        </NuxtLink>
    </div>

    <div v-if="feedbackMessage" 
         :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
         class="mb-6 p-4 rounded-lg border text-sm font-medium text-center">
        {{ feedbackMessage }}
    </div>

    <div v-if="pending" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
        <p class="text-xl text-gray-600 font-semibold">Cargando inventario...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-10 bg-red-100 rounded-xl shadow-md">
        <p class="text-xl text-red-700 font-semibold">Error al cargar el inventario: {{ error.statusMessage }}</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-purple-dark text-white">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Stock</th>
                        <th class="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">Precio</th>
                        <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Disponible</th>
                        <th class="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody v-if="inventarioData && inventarioData.productos.length > 0" class="bg-white divide-y divide-gray-200">
                    <tr v-for="producto in inventarioData.productos" :key="producto.id" class="hover:bg-purple-card transition duration-150">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-deep">{{ producto.id }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-primary-blue">{{ producto.nombre }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                  :class="getBadgeClass(producto.tipo)">
                                {{ producto.tipo }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold"
                            :class="producto.stock > 0 ? 'text-gray-700' : 'text-red-600'">
                            {{ producto.stock }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">{{ producto.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <span :class="producto.disponible ? 'text-green-500' : 'text-red-600'" class="text-2xl">
                                <font-awesome-icon :icon="producto.disponible ? 'fas fa-check-circle' : 'fas fa-times-circle'" />
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                            <button @click="editProducto(producto.id)" class="text-purple-deep hover:text-purple-light transition" title="Editar">
                                <font-awesome-icon icon="fas fa-pencil-alt" class="text-lg" />
                            </button>
                            <button @click="deleteProducto(producto.id, producto.nombre)" class="text-red-600 hover:text-red-800 transition" title="Eliminar">
                                <font-awesome-icon icon="fas fa-trash-alt" class="text-lg" />
                            </button>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="7" class="text-center py-10 text-gray-500">No se encontraron productos.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div v-if="totalPages > 1" class="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span class="text-sm text-gray-700">
                Mostrando <span class="font-semibold">{{ (currentPage - 1) * 10 + 1 }}</span>
                a <span class="font-semibold">{{ Math.min(currentPage * 10, totalCount) }}</span>
                de <span class="font-semibold">{{ totalCount }}</span> productos
            </span>
            <div class="inline-flex -space-x-px rounded-md shadow-sm">
                <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <font-awesome-icon icon="fas fa-chevron-left" class="w-3 h-3" />
                </button>
                <span class="px-4 py-2 leading-tight text-purple-deep bg-purple-100 border border-purple-300 font-semibold z-10">
                    Página {{ currentPage }} de {{ totalPages }}
                </span>
                <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <font-awesome-icon icon="fas fa-chevron-right" class="w-3 h-3" />
                </button>
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
    faPlusCircle, faPencilAlt, faTrashAlt, 
    faCheckCircle, faTimesCircle,
    faChevronLeft, faChevronRight // (NUEVO) Iconos de Paginación
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faPlusCircle, faPencilAlt, faTrashAlt, 
    faCheckCircle, faTimesCircle,
    faChevronLeft, faChevronRight
);

definePageMeta({
  middleware: 'auth' // (Cambiado a 'admin' si ya creaste admin.ts)
});

const router = useRouter();

// --- (NUEVO) Tipado para la Paginación ---
interface ProductoInventario {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  disponible: boolean;
  tipo: string;
  proveedor: string;
}
interface InventarioResponse {
  productos: ProductoInventario[];
  totalCount: number;
}

// --- (NUEVO) Estado de Paginación ---
const currentPage = ref(1);

const feedbackMessage = ref('');
const isError = ref(false);

// --- (MODIFICADO) Carga de Datos Paginada ---
const { 
  data: inventarioData, 
  pending, 
  error, 
  refresh 
} = await useAsyncData<InventarioResponse>(
  'lista-inventario',
  // La API ahora acepta la página
  () => $fetch('/api/admin/inventario', { 
    query: { page: currentPage.value } 
  }),
  { 
    watch: [currentPage] // Se refresca si 'currentPage' cambia
  }
);

// --- (NUEVO) Lógica de Paginación ---
const totalCount = computed(() => inventarioData.value?.totalCount || 0);
const totalPages = computed(() => Math.ceil(totalCount.value / 10));

const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) {
        return;
    }
    currentPage.value = page;
};

// --- Funciones (sin cambios, excepto 'deleteProducto') ---

const editProducto = (id: number) => {
  router.push(`/admin/editar-producto?id=${id}`);
};

const deleteProducto = async (id: number, nombre: string) => {
  feedbackMessage.value = '';
  isError.value = false;
  if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
    return;
  }
  try {
    const response: { message: string } = await $fetch('/api/admin/eliminar-producto', {
      method: 'DELETE',
      body: { id }
    });
    feedbackMessage.value = response.message;
    isError.value = false;
    
    // (NUEVO) Refrescar la página actual
    if (inventarioData.value?.productos.length === 1 && currentPage.value > 1) {
        currentPage.value--; // Ir a la página anterior si era el último ítem
    } else {
        refresh(); // Refrescar la página actual
    }

  } catch (err: any) {
    feedbackMessage.value = err.data?.statusMessage || 'Error al eliminar el producto.';
    isError.value = true;
  }
};

// Función para color de badge (¡reutilizada!)
const getBadgeClass = (tipo: string) => {
    if (!tipo) return 'bg-gray-100 text-gray-800';
    tipo = tipo.toLowerCase();
    if (tipo === 'servicio') {
        return 'bg-purple-100 text-purple-800';
    }
    if (tipo === 'urna') {
        return 'bg-yellow-100 text-yellow-800';
    }
    if (tipo === 'accesorio') {
        return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
};
</script>

<style scoped lang="postcss">
/* (Estilos sin cambios) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-deep { color: #5C2A72; } 
.bg-purple-deep { background-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
.bg-white-subtle { background-color: #F8F4FA; }
.bg-purple-card { background-color: #F8F4FA; }
.bg-red-100 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.border-green-300 { border-color: #86efac; }
.text-red-600 { color: #dc3545; }
.hover\:text-red-800:hover { color: #a71d2a; }
.text-green-500 { color: #22c55e; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }

/* (NUEVO) Colores de las etiquetas de categoría */
.bg-purple-100 { background-color: #f3e5f5; }
.text-purple-800 { color: #6a1b9a; }
.bg-yellow-100 { background-color: #fffde7; }
.text-yellow-800 { color: #f57f17; }
.bg-blue-100 { background-color: #e0f2fe; }
.text-blue-800 { color: #1e40af; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
</style>