<template>
  <div class="pt-14 py-12 bg-white-subtle">
    <div class="container mx-auto px-4">

      <div v-if="pendingProducto" class="text-center py-20">
        <h1 class="text-3xl font-bold text-purple-dark">Cargando producto...</h1>
      </div>

      <div v-else-if="errorProducto" class="text-center py-20 bg-red-50 rounded-xl shadow-lg border border-red-300">
        <h1 class="text-3xl font-bold text-red-700">Error al Cargar</h1>
        <p class="text-gray-600 mt-2">{{ errorProducto?.statusMessage || 'El producto no pudo ser encontrado.' }}</p>
        <button @click="router.push('/')"
          class="mt-6 px-5 py-2 bg-purple-dark text-white rounded-lg hover:bg-purple-deep transition shadow-lg">
          Volver al Inicio
        </button>
      </div>

      <div v-else-if="producto" class="max-w-4xl mx-auto">
        <div class="bg-white p-6 md:p-10 rounded-xl shadow-2xl overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div class="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                v-if="producto.imagen_url" 
                :src="producto.imagen_url" 
                :alt="producto.nombre" 
                class="w-full h-full object-cover"
              />
              <img 
                v-else 
                src="/logo2.png" 
                alt="Imagen de producto" 
                class="h-40 opacity-30"
              />
            </div>

            <div class="flex flex-col justify-center">
              <span class="bg-purple-deep text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block self-start mb-3">
                  {{ producto.tipo }}
              </span>
              <h1 class="text-4xl font-extrabold text-purple-dark mb-3">{{ producto.nombre }}</h1>
              
              <div class="flex items-center space-x-1 mb-4" v-if="valoraciones.length > 0">
                <font-awesome-icon 
                  v-for="star in 5" :key="star"
                  icon="fas fa-star" 
                  class="text-xl"
                  :class="star <= averageRating ? 'text-bd-gold-accent' : 'text-gray-300'"
                />
                <span class="text-gray-600 ml-2 text-sm font-medium">({{ valoraciones.length }} valoraciones)</span>
              </div>
              <div v-else class="text-gray-500 text-sm mb-4">Aún no hay valoraciones</div>

              <p class="text-4xl font-bold text-bd-gold-accent mb-6">
                {{ producto.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) }}
              </p>

              <div class="space-y-3 mb-6 border-y py-4">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Disponibilidad:</span>
                  <span 
                    class="font-bold px-2 py-0.5 rounded-full"
                    :class="producto.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ producto.disponible ? 'En Stock' : 'Agotado' }}
                    <span v-if="producto.tipo !== 'Servicio'"> ({{ producto.stock }})</span>
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Categoría:</span>
                  <span class="font-semibold text-purple-dark">{{ producto.tipo }}</span>
                </div>
                <div v-if="producto.tipo !== 'Servicio'" class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Proveedor:</span>
                  <span class="font-semibold text-purple-dark">{{ producto.proveedor }}</span>
                </div>
              </div>
              
              <button 
                @click="addToCart(producto)" 
                :disabled="!producto.disponible"
                class="w-full bg-purple-deep text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-light transition duration-200 shadow-xl flex items-center justify-center space-x-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon icon="fas fa-shopping-cart" />
                <span>{{ producto.disponible ? 'Añadir al Carrito' : 'Agotado' }}</span>
              </button>
            </div>
          </div>
          
          <div class="mt-10 pt-6 border-t">
            <h3 class="text-2xl font-bold text-purple-dark mb-4">Descripción</h3>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ producto.descripcion }}
            </p>
          </div>
        </div>

        <div class="mt-12">
          <h2 class="text-3xl font-bold text-purple-dark mb-6 border-b pb-3">
            Valoraciones y Comentarios
          </h2>
          <div v-if="user" class="bg-white p-6 rounded-xl shadow-xl mb-8 border-t-4 border-purple-deep">
            <h3 class="text-xl font-semibold text-purple-dark mb-4">Deja tu valoración</h3>
            <div v-if="userHasReviewed">
              <p class="text-green-700 bg-green-100 p-3 rounded-lg">Gracias, ya has enviado tu valoración para este producto.</p>
            </div>
            <form v-else @submit.prevent="handleSubmitReview" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Tu puntuación:</label>
                <div class="flex space-x-1 text-3xl">
                  <font-awesome-icon 
                    v-for="star in 5" :key="star"
                    :icon="star <= newReview.rating ? 'fas fa-star' : 'far fa-star'"
                    @click="newReview.rating = star"
                    class="cursor-pointer transition-transform duration-150 transform hover:scale-110"
                    :class="star <= newReview.rating ? 'text-bd-gold-accent' : 'text-gray-400'"
                  />
                </div>
              </div>
              <div>
                <label for="comentario" class="block text-sm font-semibold text-dark-primary-blue mb-2">Tu comentario (opcional):</label>
                <textarea 
                  v-model="newReview.comentario"
                  id="comentario" 
                  rows="3" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-deep"
                  placeholder="Describe tu experiencia con este producto..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                :disabled="newReview.rating === 0 || isLoading"
                class="bg-purple-deep text-white py-2 px-5 rounded-lg font-bold hover:bg-purple-light transition duration-150 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Enviando...' : 'Enviar Valoración' }}
              </button>
              <p v-if="feedbackMessage" :class="isError ? 'text-red-600' : 'text-green-700'" class="text-sm mt-2">{{ feedbackMessage }}</p>
            </form>
          </div>
          <div v-else class="bg-gray-100 p-6 rounded-xl shadow-md mb-8 text-center">
            <p class="text-gray-700">
              <NuxtLink to="/login" class="font-bold text-purple-deep hover:underline">Inicia sesión</NuxtLink> para dejar tu valoración.
            </p>
          </div>

          <div v-if="pendingValoraciones" class="text-center py-10">
            <p class="text-gray-600">Cargando comentarios...</p>
          </div>
          <div v-else-if="valoraciones.length > 0" class="space-y-6">
            <div v-for="v in valoraciones" :key="v.id_valoracion" class="bg-white p-5 rounded-lg shadow-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-purple-dark">{{ v.autor }}</span>
                <span class="text-xs text-gray-500">{{ v.fecha }}</span>
              </div>
              <div class="flex items-center space-x-1 mb-3">
                <font-awesome-icon 
                  v-for="star in 5" :key="star"
                  icon="fas fa-star" 
                  class="text-lg"
                  :class="star <= v.rating ? 'text-bd-gold-accent' : 'text-gray-300'"
                />
              </div>
              <p class="text-gray-700 italic">"{{ v.comentario || 'Sin comentario.' }}"</p>
            </div>
          </div>
          <div v-else class="text-center py-10 bg-white rounded-lg shadow-md">
            <p class="text-gray-600">No hay comentarios para este producto todavía.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoppingCart, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

library.add(faShoppingCart, faStarSolid, faStarRegular);

// --- (MODIFICADO) Tipado ---
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  // --- Nuevos campos ---
  descripcion: string;
  stock: number;
  disponible: boolean;
  proveedor: string;
  imagen_url: string | null;
}
interface Valoracion {
  id_valoracion: number;
  rating: number;
  comentario: string | null;
  fecha: string;
  autor: string;
}

// --- Setup ---
const route = useRoute();
const router = useRouter();
const user = useUser();
const { addToCart } = useCart();
const productoId = ref(route.query.id as string);

// --- Carga de Datos del Producto ---
const { 
  data: producto, 
  pending: pendingProducto, 
  error: errorProducto 
} = await useAsyncData<Producto>(
  'detalle-producto',
  () => {
    if (!productoId.value) throw createError({ statusCode: 400, statusMessage: 'Falta ID de producto' });
    // (MODIFICADO) Llama a la API actualizada
    return $fetch('/api/detalle-producto', { query: { id: productoId.value } }) 
  },
  { watch: [productoId] }
);

// --- Carga de Datos de Valoraciones ---
const { 
  data: valoracionesData, 
  pending: pendingValoraciones, 
  refresh: refreshValoraciones 
} = await useAsyncData<Valoracion[]>(
  'lista-valoraciones',
  async () => {
    if (!productoId.value) {
        return []; 
    }
    return $fetch('/api/valoraciones', { query: { id: productoId.value } })
  },
  { 
    watch: [productoId]
  }
);

// (Soluciona el error 'length')
const valoraciones = computed(() => valoracionesData.value || []);

// --- Lógica de Formulario de Valoración (sin cambios) ---
const newReview = ref({
  rating: 0,
  comentario: ''
});
const isLoading = ref(false);
const feedbackMessage = ref('');
const isError = ref(false);

const handleSubmitReview = async () => {
  if (!user.value || !producto.value) return;
  if (newReview.value.rating === 0) {
    isError.value = true;
    feedbackMessage.value = 'Por favor, selecciona al menos una estrella.';
    return;
  }
  isLoading.value = true;
  isError.value = false;
  feedbackMessage.value = '';
  try {
    await $fetch('/api/valoraciones', {
      method: 'POST',
      body: {
        id_producto: producto.value.id,
        id_usuario: user.value.id_usuario,
        rating: newReview.value.rating,
        comentario: newReview.value.comentario
      }
    });
    feedbackMessage.value = '¡Gracias por tu valoración!';
    newReview.value = { rating: 0, comentario: '' }; 
    refreshValoraciones(); 
  } catch (err: any) {
    isError.value = true;
    feedbackMessage.value = err.data?.statusMessage || 'Error al enviar la valoración.';
  } finally {
    isLoading.value = false;
  }
};

// --- Valores Calculados (sin cambios) ---
const averageRating = computed(() => {
  if (valoraciones.value.length === 0) return 0;
  const sum = valoraciones.value.reduce((acc, v) => acc + v.rating, 0);
  return Math.round(sum / valoraciones.value.length);
});
const userHasReviewed = computed(() => {
  if (!user.value) return false;
  return valoraciones.value.some(v => v.autor.includes(user.value?.nombre || '---'));
});
</script>

<style scoped>
/* (Estilos sin cambios) */
.bg-purple-dark { background-color: #4A235A; } 
.text-purple-dark { color: #4A235A; }
.bg-purple-deep { background-color: #5C2A72; }
.text-purple-deep { color: #5C2A72; }
.border-purple-deep { border-color: #5C2A72; }
.focus\:ring-purple-deep:focus { --tw-ring-color: #5C2A72; }
.focus\:border-purple-deep:focus { border-color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-bd-gold-accent { color: #FFD700; }
.bg-white-subtle { background-color: #F8F4FA; }
.text-dark-primary-blue { color: #34495e; }
.bg-red-50 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.text-red-600 { color: #dc3545; }
.bg-green-100 { background-color: #d4edda; } 
.text-green-700 { color: #155724; } 
.text-green-800 { color: #155724; }
.bg-red-100 { background-color: #f8d7da; }
.text-red-800 { color: #721c24; }
.whitespace-pre-wrap { white-space: pre-wrap; }
</style>