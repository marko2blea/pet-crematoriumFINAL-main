<template>
  <div>

        <section 
      class="relative h-[60vh] md:h-[80vh] text-white flex items-center justify-center text-center shadow-lg"
      style="background-image: url('/index.jpg'); background-size: cover; background-position: center;"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 p-4">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 animate-slide-in-top">
          APOYO EN LOS MOMENTOS MÁS DIFÍCILES
        </h1>
        <p class="text-lg md:text-2xl mb-8 animate-slide-in-bottom">
          ENTREGANDO UN SERVICIO PROFESIONAL, RESPETUOSO Y EMPÁTICO PARA QUIENES PIERDEN A UN SER QUERIDO.
        </p>
        <NuxtLink to="/#servicios" 
          class="bg-bd-gold-accent text-purple-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 transition duration-300 transform hover:scale-105 shadow-xl animate-fade-in">
          Ver Servicios
        </NuxtLink>
      </div>
    </section>

        <section id="servicios" class="py-16 bg-white">
    <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <ClientOnly>
                <div 
                    v-for="servicio in servicios" 
                    :key="servicio.id" 
                    class="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col border border-gray-200"
                >
                    <NuxtLink :to="`/detalle-producto?id=${servicio.id}`" class="block flex flex-col flex-grow">
                                                <div class="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden"> 
                            <img 
                                :src="servicio.imagen_url || '/logo-placeholder.svg'" 
                                :alt="servicio.nombre" 
                                class="max-h-3/4 max-w-3/4 object-contain" 
                                @error="servicio.imagen_url = '/logo-placeholder.svg'"
                            />
                        </div>
                        
                        <div class="p-5 flex flex-col flex-grow">
                            <span 
                                class="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block self-start mb-2"
                                :class="getCategoryClasses(servicio.tipo)"
                            >
                                {{ servicio.tipo }}
                            </span>
                            <h3 class="text-xl font-bold text-purple-dark my-3 h-12 overflow-hidden">{{ servicio.nombre }}</h3>
                            <div class="mt-auto pt-4 border-t border-gray-100">
                                <span class="text-2xl font-extrabold text-bd-gold-accent block mb-3">
                                    ${{ servicio.precio.toLocaleString('es-CL') }}
                                </span>
                                <button 
                                    class="w-full bg-purple-deep text-white py-2 px-3 rounded-lg font-bold hover:bg-purple-light hover:scale-105 transition transform duration-150 shadow-md text-sm"
                                >
                                    Ver Producto
                                </button>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </ClientOnly>
        </div>
    </div>
</section>


        <section id="productos" class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
                <h2 class="text-4xl font-extrabold text-purple-dark mb-12 text-center relative z-10 flex items-center justify-center">
          Urnas y <span class="text-bd-gold-accent ml-2">Accesorios</span>
          <span class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-bd-gold-accent rounded-full"></span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <ClientOnly>
            <div 
              v-for="producto in productos_filtrados" 
              :key="producto.id" 
              class="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col border border-gray-200"
            >
              <NuxtLink :to="`/detalle-producto?id=${producto.id}`" class="block flex flex-col flex-grow">
                                <div class="w-full h-48 bg-purple-deep overflow-hidden"> 
                  <img 
                    :src="producto.imagen_url || '/logo-placeholder.svg'" 
                    :alt="producto.nombre" 
                    class="w-full h-full object-cover"
                    @error="producto.imagen_url = '/logo-placeholder.svg'"
                  />
                </div>
                <div class="p-5 flex flex-col flex-grow">
                                    <span 
                    class="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block self-start mb-2"
                    :class="getCategoryClasses(producto.tipo)"
                  >
                    {{ producto.tipo }}
                  </span>
                  <h3 class="text-xl font-bold text-purple-dark my-3 h-12 overflow-hidden">{{ producto.nombre }}</h3>
                                    <div class="mt-auto pt-4 border-t border-gray-100">
                    <span class="text-2xl font-extrabold text-bd-gold-accent block mb-3">
                      ${{ producto.precio.toLocaleString('es-CL') }}
                    </span>
                    <button 
                      class="w-full bg-purple-deep text-white py-2 px-3 rounded-lg font-bold hover:bg-purple-light hover:scale-105 transition transform duration-150 shadow-md text-sm"
                    >
                      Ver Producto
                    </button>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </ClientOnly>
        </div>
      </div>
    </section>

        <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
                <h2 class="text-4xl font-extrabold text-purple-dark mb-12 text-center relative z-10 flex items-center justify-center">
          Conócenos y Nuestras <span class="text-bd-gold-accent ml-2">Instalaciones</span>
          <span class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-bd-gold-accent rounded-full"></span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div class="relative rounded-xl overflow-hidden shadow-xl transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-200">
            <img src="/phh.jpg" alt="Nosotros" class="w-full h-64 object-cover"/>
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <h3 class="text-2xl font-bold text-white mb-2">Sobre Nosotros</h3>
              <p class="text-white text-sm mb-4">
                Brindamos un servicio profesional y respetuoso, acompañando a las familias en los momentos más difíciles con empatía y calidez.
              </p>
              <NuxtLink to="/about" class="inline-block bg-bd-gold-accent text-purple-dark font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-yellow-400 hover:scale-105 transition transform">
                Conocernos
              </NuxtLink>
            </div>
            
          </div>

          <div class="relative rounded-xl overflow-hidden shadow-xl transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-200">
            <img src="/instalaciones.jpg" alt="Instalaciones" class="w-full h-64 object-cover"/>
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <h3 class="text-2xl font-bold text-white mb-2">Nuestras Instalaciones</h3>
              <p class="text-white text-sm mb-4">
                Contamos con espacios modernos, cálidos y tranquilos, diseñados para ofrecer un ambiente de paz y respeto durante los servicios.
              </p>
              <NuxtLink to="/instalaciones" class="inline-block bg-bd-gold-accent text-purple-dark font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-yellow-400 hover:scale-105 transition transform">
                Ver Instalaciones
              </NuxtLink>
            </div>
          </div>

        </div>
        
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'; 
import type { Product } from '../../app/types';

// Función para asignar clases de color al badge según el tipo
const getCategoryClasses = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'servicio':
      return 'bg-purple-light text-white'; 
    case 'urna':
      return 'bg-bd-gold-accent text-purple-dark';
    case 'accesorio':
      return 'bg-gray-300 text-purple-dark';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}


const { data: allProductos } = await useAsyncData<Product[]>('productos-index', () => $fetch('/api/productos'));

// Productos filtrados para Servicios
const servicios = computed(() => {
  if (!allProductos.value) return [];
  return allProductos.value.filter(p => p.tipo === 'Servicio');
});

// Productos filtrados para Urnas y Accesorios
const productos_filtrados = computed(() => {
  if (!allProductos.value) return [];
  return allProductos.value.filter(p => p.tipo === 'Urna' || p.tipo === 'Accesorio');
});
</script>

<style scoped lang="postcss">
/* Animaciones para el Hero Banner */
@keyframes slide-in-top {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-slide-in-top { animation: slide-in-top 0.8s ease forwards; }
.animate-slide-in-bottom { animation: slide-in-top 0.8s ease 0.3s forwards; } /* Retraso para la segunda línea */
.animate-fade-in { animation: slide-in-top 0.8s ease 0.6s forwards; } /* Retraso para el botón */


/* Colores proyecto - Clases de Utilidad */
.text-purple-dark { color:#4A235A; }
.bg-purple-dark { background-color:#4A235A; } 
.bg-purple-light { background-color:#6C3483; }
.bg-purple-deep { background-color:#5C2A72; } 
.text-bd-gold-accent { color:#FFD700; }
.bg-bd-gold-accent { background-color:#FFC107; }
</style>

