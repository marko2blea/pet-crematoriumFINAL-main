<template>
  <div> <section class="relative h-[60vh] md:h-[80vh] text-white flex items-center justify-center text-center shadow-lg" 
             style="background-image: url('/index.jpg'); background-size: cover; background-position: center; background-attachment: fixed;">
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 p-4">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 animate-slide-in-top">
          APOYO EN LOS MOMENTOs MÁS DIFÍCILES
        </h1>
        <p class="text-lg md:text-2xl mb-8 animate-slide-in-bottom">
          ENTREGANDO UN SERVICIO PROFESIONAL, RESPETUOSO Y EMPÁTICO PARA QUIENES PIERDEN A UN SER QUERIDO.
        </p>
        <NuxtLink to="/#catalogo" 
           class="bg-bd-gold-accent text-purple-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 transition duration-300 transform hover:scale-105 shadow-xl animate-fade-in">
          Ver Catálogo
        </NuxtLink>
      </div>
    </section>

    <section id="catalogo" class="py-16">
      <div class="container mx-auto px-4">

        <div class="bg-white p-6 md:p-8 rounded-xl shadow-2xl border-t-8 border-purple-deep mb-12">
            <h2 class="text-xl font-extrabold text-purple-dark mb-4 flex items-center">
                <font-awesome-icon icon="fas fa-filter" class="mr-3 text-bd-gold-accent" /> Filtro de Búsqueda
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                <div class="relative w-full lg:col-span-2">
                    <input 
                        type="text" 
                        v-model="busquedaTexto" 
                        placeholder="Buscar por nombre..."
                        class="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-deep focus:ring-1 focus:ring-purple-deep focus:outline-none transition duration-150 shadow-inner text-sm"
                    />
                    <font-awesome-icon icon="fas fa-search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <select 
                    v-model="filtroTipo"
                    class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-deep focus:ring-1 focus:ring-purple-deep focus:outline-none bg-white transition duration-150 shadow-inner text-sm appearance-none cursor-pointer"
                >
                    <option value="todos">Todas las Categorías</option> 
                    <option value="Servicio">Servicios</option>
                    <option value="Urna">Urnas</option>
                    <option value="Accesorio">Accesorios</option>
                </select>
                <select 
                    v-model="filtroPrecio"
                    class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-deep focus:ring-1 focus:ring-purple-deep focus:outline-none bg-white transition duration-150 shadow-inner text-sm appearance-none cursor-pointer"
                >
                    <option value="todos">Cualquier Precio</option>
                    <option value="bajo">Menos de $50.000</option>
                    <option value="medio">$50.000 - $150.000</option>
                    <option value="alto">Más de $150.000</option>
                </select>
                <button 
                    @click="limpiarFiltros" 
                    class="w-full bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition duration-150 shadow-lg flex items-center justify-center space-x-2"
                >
                    <font-awesome-icon icon="fas fa-times" />
                    <span>Limpiar Filtros</span>
                </button>
            </div>
            <div class="flex items-center justify-center mt-4 pt-4 border-t border-gray-100">
                <input type="checkbox" v-model="filtroFavoritos" id="fav-toggle" class="h-5 w-5 text-purple-deep rounded focus:ring-purple-deep border-gray-300">
                <label for="fav-toggle" class="ml-2 text-sm font-semibold text-dark-primary-blue cursor-pointer">Mostrar solo mis favoritos</label>
            </div>
        </div>

        <div v-if="pending" class="text-center text-gray-500 py-10">Cargando productos...</div>
        <div v-else-if="error" class="text-center text-red-500 py-10">Error al cargar los productos.</div>
        
        <div v-else-if="serviciosFiltrados.length === 0 && urnasFiltradas.length === 0" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
            <font-awesome-icon icon="fas fa-times-circle" class="text-4xl text-red-400 mb-3" />
            <h3 class="text-2xl font-bold text-purple-dark">Sin Resultados</h3>
            <p class="text-gray-600">No se encontraron productos que coincidan con tus filtros.</p>
        </div>

        <div v-else>
            <div v-if="serviciosFiltrados.length > 0">
                <h2 class="text-3xl font-extrabold text-purple-dark mb-8 text-center">Nuestros Servicios</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div 
                        v-for="servicio in serviciosFiltrados" 
                        :key="servicio.id" 
                        class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 relative flex flex-col"
                    >
                        <button 
                            @click.stop="toggleFavorite(servicio.id)"
                            class="absolute top-3 right-3 z-10 p-2 bg-white/70 rounded-full text-red-500 hover:scale-110 transition-transform"
                            title="Añadir a favoritos"
                        >
                            <font-awesome-icon :icon="isFavorite(servicio.id) ? ['fas', 'heart'] : ['far', 'heart']" class="text-xl" />
                        </button>
                        <NuxtLink :to="`/detalle-producto?id=${servicio.id}`" class="block flex flex-col flex-grow">
                            <div class="w-full h-40 object-cover bg-gray-200 flex items-center justify-center">
                                <img src="/logo2.png" alt="Logo de servicio" class="h-20 opacity-30"/>
                            </div>
                            <div class="p-5 flex flex-col flex-grow">
                                <span :class="getBadgeClass(servicio.tipo)" class="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block self-start">
                                    {{ servicio.tipo }}
                                </span>
                                <h3 class="text-xl font-bold text-purple-dark my-3 h-12 overflow-hidden">{{ servicio.nombre }}</h3>
                                <div class="mt-auto">
                                    <span class="text-2xl font-extrabold text-bd-gold-accent block mb-3">
                                        ${{ servicio.precio.toLocaleString('es-CL') }}
                                    </span>
                                    <button 
                                      @click.prevent="addToCart(servicio)"
                                      class="w-full bg-purple-deep text-white py-2 px-3 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md text-sm"
                                    >
                                      <font-awesome-icon icon="fas fa-shopping-cart" class="mr-2" />
                                      Añadir al Carrito
                                    </button>
                                </div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div v-if="urnasFiltradas.length > 0" class="mt-16">
                <h2 class="text-3xl font-extrabold text-purple-dark mb-8 text-center">Productos especiales para recordar a tu mascota</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div 
                        v-for="urna in urnasFiltradas" 
                        :key="urna.id" 
                        class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 relative flex flex-col"
                    >
                        <button 
                            @click.stop="toggleFavorite(urna.id)"
                            class="absolute top-3 right-3 z-10 p-2 bg-white/70 rounded-full text-red-500 hover:scale-110 transition-transform"
                            title="Añadir a favoritos"
                        >
                            <font-awesome-icon :icon="isFavorite(urna.id) ? ['fas', 'heart'] : ['far', 'heart']" class="text-xl" />
                        </button>
                        <NuxtLink :to="`/detalle-producto?id=${urna.id}`" class="block flex flex-col flex-grow">
                            <div class="w-full h-32 object-cover bg-gray-200 flex items-center justify-center">
                                <img src="/logo2.png" alt="Logo de producto" class="h-16 opacity-30"/>
                            </div>
                            <div class="p-5 flex flex-col flex-grow">
                                <span :class="getBadgeClass(urna.tipo)" class="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block self-start">
                                    {{ urna.tipo }}
                                </span>
                                <h3 class="text-xl font-bold text-purple-dark my-3 h-10 overflow-hidden">{{ urna.nombre }}</h3>
                                <div class="mt-auto">
                                    <span class="text-2xl font-extrabold text-bd-gold-accent block mb-3">
                                        ${{ urna.precio.toLocaleString('es-CL') }}
                                    </span>
                                    <button 
                                      @click.prevent="addToCart(urna)"
                                      class="w-full bg-purple-deep text-white py-2 px-3 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md text-sm"
                                    >
                                      <font-awesome-icon icon="fas fa-shopping-cart" class="mr-2" />
                                      Añadir al Carrito
                                    </button>
                                </div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
    faHeart as faHeartSolid, faCheck, faShoppingCart, faArrowRight, 
    faFilter, faSearch, faTimes, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import type { Product } from '../../app/types';

library.add(
    faCheck, faShoppingCart, faArrowRight, faHeartSolid, faHeartRegular,
    faFilter, faSearch, faTimes, faTimesCircle
);

const { favorites, toggleFavorite, isFavorite } = useFavorites();
const { addToCart } = useCart();

// --- (CORRECCION) Carga de Datos ---
const { 
  data: productosData, 
  pending, 
  error 
} = await useAsyncData<Product[]>(
  'lista-productos-publica',
  () => $fetch('/api/productos'), // <-- CORREGIDO: Ruta absoluta (empieza con /)
  { 
    default: () => [] 
  } 
);

const productos = computed(() => productosData.value || []);

// --- ESTADO DE FILTRO Y BUSQUEDA ---
const busquedaTexto = ref('');
const filtroTipo = ref('todos'); 
const filtroPrecio = ref('todos'); 
const filtroFavoritos = ref(false); 

const limpiarFiltros = () => {
    busquedaTexto.value = '';
    filtroTipo.value = 'todos';
    filtroPrecio.value = 'todos';
    filtroFavoritos.value = false;
};

const aplicarFiltroPrecio = (precio: number, filtro: string) => {
    switch (filtro) {
        case 'bajo': return precio < 50000;
        case 'medio': return precio >= 50000 && precio <= 150000;
        case 'alto': return precio > 150000;
        default: return true;
    }
};

// --- Filtros ---
const productosFiltrados = computed(() => {
    const textoMinuscula = busquedaTexto.value.toLowerCase();
    
    return productos.value.filter(item => { 
        const tipoDeseado = filtroTipo.value.toLowerCase();
        const itemTipo = item.tipo.toLowerCase();
        
        const coincideTipo = tipoDeseado === 'todos' || itemTipo === tipoDeseado;
        const coincidePrecio = aplicarFiltroPrecio(item.precio, filtroPrecio.value);
        const coincideTexto = !textoMinuscula || 
                              item.nombre.toLowerCase().includes(textoMinuscula);
        
        const coincideFavorito = !filtroFavoritos.value || isFavorite(item.id);

        return coincideTipo && coincidePrecio && coincideTexto && coincideFavorito;
    });
});

const serviciosFiltrados = computed(() => {
  return productosFiltrados.value.filter(p => p.tipo === 'Servicio');
});

const urnasFiltradas = computed(() => {
  return productosFiltrados.value.filter(p => p.tipo === 'Urna' || p.tipo === 'Accesorio');
});

const favoriteProducts = computed(() => {
    return productos.value.filter(p => isFavorite(p.id));
});

// --- Función para Clases de Etiqueta (Badge) ---
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
/* (Estilos de la paleta de colores) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; } 
.bg-purple-light { background-color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; } 
.text-purple-deep { color: #5C2A72; } 
.border-purple-deep { border-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.text-bd-gold-accent { color: #FFD700; }
.bg-bd-gold-accent { background-color: #FFC107; }
.bg-purple-card { background-color: #F8F4FA; } 
.text-green-500 { color: #22c55e; }
.text-red-500 { color: #ef4444; } 
.bg-white\/70 { background-color: rgba(255, 255, 255, 0.7); } 
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.hover\:bg-yellow-500:hover { background-color: #ECC94B; }
.bg-red-50 { background-color: #fef2f2; }
.text-red-400 { color: #f87171; }

/* Colores de las etiquetas de categoría (como en Inventario) */
.bg-purple-100 { background-color: #f3e5f5; }
.text-purple-800 { color: #6a1b9a; }
.bg-yellow-100 { background-color: #fffde7; }
.text-yellow-800 { color: #f57f17; }
.bg-blue-100 { background-color: #e0f2fe; }
.text-blue-800 { color: #1e40af; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }

/* Ocultar flecha nativa de los select */
select {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath fill='%236B7280' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3e%3c/svg%3e");
    background-position: right 0.7rem center;
    background-size: 1.5em 1.5em;
    background-repeat: no-repeat;
    /* (CORRECCION) Añadido @apply */
    @apply appearance-none;
}
</style>