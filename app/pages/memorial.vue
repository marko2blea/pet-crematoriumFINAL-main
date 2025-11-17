<template>
    <div class="min-h-screen pt-14 bg-gray-50">
        
        <div class="relative w-full h-80 overflow-hidden shadow-xl">
            <div 
                class="absolute inset-0 bg-cover bg-center opacity-50" 
                style="background-image: url('/banner2.avif');" 
                alt="Fondo de huella de mascota"
            ></div>
            
            <div class="relative z-10 text-white text-center flex flex-col justify-center h-full container mx-auto px-4">
                <h1 class="text-4xl md:text-6xl font-extrabold mb-3 leading-tight drop-shadow-lg text-bd-gold-accent">
                    Muro de la Memoria
                </h1>
                <p class="text-xl md:text-2xl font-light max-w-3xl mx-auto drop-shadow-md text-purple-dark text-bold">
                    Un espacio para honrar la vida de los compañeros que tocaron nuestros corazones.
                </p>
            </div>
        </div>

        <div class="container mx-auto px-4 py-12 -mt-10 relative z-20">
            
            <div v-if="user && user.id_rol !== 1" class="max-w-3xl mx-auto p-4 md:p-6 rounded-xl border border-dashed border-purple-deep mb-12 flex justify-center bg-white shadow-lg">
                <router-link to="/admin/agregar-mascota">
                    <button 
                        class="bg-purple-deep text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-purple-light transition duration-200 shadow-xl flex items-center justify-center space-x-2"
                    >
                        <font-awesome-icon icon="fas fa-plus-circle" class="text-xl" />
                        <span>Añadir Nuevo Memorial</span>
                    </button>
                </router-link>
            </div>

            <h2 class="text-3xl font-extrabold mb-8 text-dark-primary-blue text-center py-10">
                <font-awesome-icon icon="fas fa-cloud-sun" class="mr-2 text-purple-deep" /> Mensajes en el Cielo
            </h2>

            <div v-if="feedbackMessage" 
                 :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
                 class="mb-6 p-4 rounded-lg border text-sm font-medium text-center">
                {{ feedbackMessage }}
            </div>

            <div v-if="pending" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
                <p class="text-xl text-gray-600 font-semibold">Cargando tributos...</p>
            </div>
            
            <div v-else-if="error" class="text-center py-10 bg-red-100 rounded-xl shadow-md">
                <p class="text-xl text-red-700 font-semibold">Error al cargar tributos: {{ error.statusMessage }}</p>
            </div>
            
            <div v-else-if="memoriales && memoriales.length === 0" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
                <font-awesome-icon icon="fas fa-hand-holding-heart" class="text-6xl text-gray-400 mb-4" />
                <p class="text-xl text-gray-600 font-semibold">Aún no hay mensajes. Un administrador puede añadir el primer tributo.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div 
                    v-for="(tributo, index) in memoriales" 
                    :key="tributo.id_memorial" 
                    class="bg-white p-6 rounded-xl shadow-xl border-l-4 hover:shadow-2xl transition duration-300 relative"
                    :class="index % 3 === 0 ? 'border-purple-deep' : (index % 3 === 1 ? 'border-dark-primary-blue' : 'border-gray-400')"
                >
                    <div v-if="user && user.id_rol !== 1" class="absolute top-2 right-2 flex space-x-1">
                        <button @click="editMemorial(tributo.id_memorial)" title="Editar"
                                class="h-8 w-8 rounded-full bg-purple-deep text-white hover:bg-purple-light flex items-center justify-center transition shadow">
                            <font-awesome-icon icon="fas fa-pencil-alt" class="text-xs" />
                        </button>
                        <button @click="deleteMemorial(tributo.id_memorial, tributo.nombre)" title="Eliminar"
                                class="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-800 flex items-center justify-center transition shadow">
                            <font-awesome-icon icon="fas fa-trash-alt" class="text-xs" />
                        </button>
                    </div>

                    <div class="flex items-center mb-3">
                        <font-awesome-icon icon="fas fa-paw" class="text-xl mr-3" :class="index % 2 === 0 ? 'text-purple-deep' : 'text-dark-primary-blue'" />
                        <span class="text-lg font-bold text-dark-primary-blue">{{ tributo.nombre }} <span v-if="tributo.raza" class="text-sm font-normal text-gray-500">({{ tributo.raza }})</span></span>
                    </div>
                    
                    <p class="text-gray-700 italic mb-4 h-20 overflow-hidden text-sm leading-relaxed">
                        "{{ tributo.dedicatoria || 'Un compañero leal, siempre recordado.' }}"
                    </p>
                    
                    <div class="text-right text-xs text-gray-500 border-t pt-2 mt-auto">
                        <font-awesome-icon icon="fas fa-clock" class="mr-1" /> {{ formatTime(tributo.fecha) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'; 
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
    faPlusCircle, faQuoteLeft, faClock, faCloudSun, faHandHoldingHeart, 
    faChevronDown, faPaw, faPencilAlt, faTrashAlt 
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faPlusCircle, faQuoteLeft, faClock, faCloudSun, faHandHoldingHeart, 
    faChevronDown, faPaw, faPencilAlt, faTrashAlt
); 

// --- Tipado y Carga de Datos ---
interface Memorial {
    id_memorial: number;
    nombre: string;
    raza: string | null;
    fecha: string; // La API la enviará como string ISO
    dedicatoria: string | null;
}

// (NUEVO) Tipo para la respuesta de la API de borrado
interface DeleteApiResponse {
  statusCode: number;
  message: string;
}

const user = useUser(); // Para mostrar/ocultar botones de admin
const router = useRouter();

const feedbackMessage = ref('');
const isError = ref(false);

const { 
  data: memoriales, 
  pending, 
  error,
  refresh // Función para recargar la lista
} = await useAsyncData<Memorial[]>(
  'lista-memoriales',
  () => $fetch('/api/memoriales'), // Llama a la API pública
  { default: () => [] }
);

// --- Funciones ---

const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Importante para que no se desfase por un día
    });
};

const editMemorial = (id: number) => {
    router.push(`/admin/editar-memorial?id=${id}`);
};

const deleteMemorial = async (id: number, nombre: string) => {
  feedbackMessage.value = '';
  isError.value = false;

  if (!confirm(`¿Estás seguro de eliminar el memorial de "${nombre}"?`)) {
    return;
  }

  try {
    // (CORREGIDO) Añadido el tipo <DeleteApiResponse>
    const response = await $fetch<DeleteApiResponse>('../api/admin/eliminar-memorial', {
      method: 'DELETE',
      body: { id: id }
    });

    isError.value = false;
    feedbackMessage.value = response.message; // <-- Esta línea ahora es segura
    refresh(); // Vuelve a cargar la lista de memoriales

  } catch (err: any) {
    isError.value = true;
    feedbackMessage.value = err.data?.statusMessage || 'Error al eliminar.';
  }
};

definePageMeta({
    title: 'Muro de la Memoria'
});
</script>

<style scoped>
/* (Estilos sin cambios) */
.bg-purple-dark {
    background-color: #4A235A; 
}
.text-purple-dark {
    color: #4A235A; 
}
.bg-purple-light {
    background-color: #6C3483; 
}
.bg-purple-deep {
    background-color: #5C2A72; 
}
.text-purple-deep {
    color: #5C2A72; 
}
.border-purple-deep {
    border-color: #5C2A72; 
}
.bg-purple-card {
    background-color: #F8F4FA; 
}
.bg-dark-primary-blue { background-color: #34495e; }
.text-dark-primary-blue { color: #34495e; }
.border-dark-primary-blue { border-color: #34495e; }
.bg-white-subtle { background-color: #F8F4FA; }
.text-bd-gold-accent { 
    color: #FFD700; 
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
.hero-background {
    background-image: url('/paw-print.jpg');
}
.bg-red-600 { background-color: #dc3545; }
.hover\:bg-red-800:hover { background-color: #a71d2a; }
.bg-red-100 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.border-green-300 { border-color: #86efac; }
</style>