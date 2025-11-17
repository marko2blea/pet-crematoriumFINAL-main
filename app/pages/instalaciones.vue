<template>
  <div class="container mx-auto px-4 py-16 font-sans pt-20">
    
    <div class="flex justify-center items-center mb-6 max-w-4xl mx-auto">
      <h1 
        class="text-3xl md:text-4xl font-extrabold text-purple-dark"
        :contenteditable="isAnyEditing"
        @blur="null" 
        :class="{'editable-field': isAnyEditing}"
      >
        Nuestras Instalaciones
      </h1>
    </div>
    <p 
      class="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto"
      :contenteditable="isAnyEditing"
      @blur="null"
      :class="{'editable-field': isAnyEditing}"
    >
      Diseñadas para ofrecer un ambiente de paz y respeto, nuestras instalaciones proporcionan la comodidad y privacidad necesarias para despedir a su compañero de vida.
    </p>

    <div v-if="feedbackMessage" 
         :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
         class="mb-6 p-4 rounded-lg border text-sm font-medium text-center max-w-4xl mx-auto">
        {{ feedbackMessage }}
    </div>

    <div v-if="pending" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
        <p class="text-xl text-gray-600 font-semibold">Cargando secciones...</p>
    </div>
    <div v-else-if="error" class="text-center py-10 bg-red-100 rounded-xl shadow-md">
        <p class="text-xl text-red-700 font-semibold">Error al cargar: {{ error.statusMessage }}</p>
    </div>
    <div v-else-if="sections.length === 0" class="text-center py-10 bg-white-subtle rounded-xl shadow-md">
        <p class="text-xl text-gray-600 font-semibold">No hay secciones de instalaciones creadas. Un administrador puede añadir la primera.</p>
    </div>

    <div v-for="(section, index) in sections" :key="section.id_instalacion" class="relative">
      <div class="bg-white shadow-xl rounded-lg overflow-hidden mb-8 border border-gray-200"
           :class="{'border-2 border-dashed border-purple-deep': section.isEditing}">
        <div class="p-8 md:p-12">
          
          <div class="flex justify-between items-start mb-4 border-b pb-2">
            <h2 
              class="text-3xl font-bold text-purple-dark flex-grow"
              :contenteditable="section.isEditing"
              @blur="handleContentUpdate($event, index, 'title')"
              :class="{'editable-field': section.isEditing}"
              title="Título de la sección"
            >
              {{ section.title }}
            </h2>
            
            <div v-if="user && user.id_rol !== 1" class="flex items-center space-x-2 ml-4">
                <button 
                    @click="section.isEditing ? saveCard(index) : editCard(index)"
                    class="text-white transition duration-150 p-2 rounded-full shadow-md"
                    :class="section.isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-dark hover:bg-purple-light'"
                    :title="section.isEditing ? 'Guardar Cambios' : 'Editar Tarjeta'">
                    <font-awesome-icon :icon="section.isEditing ? 'fas fa-save' : 'fas fa-pencil-alt'" class="text-xl" />
                </button>

                <button v-if="!section.isEditing" @click="removeSection(index)"
                  class="text-red-600 hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-gray-100"
                  title="Eliminar esta sección">
                  <font-awesome-icon icon="fas fa-trash" class="text-xl" />
                </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div :class="{'order-last md:order-first': index % 2 !== 0}"> 
              <p 
                class="text-gray-700 mb-4"
                :contenteditable="section.isEditing"
                @blur="handleContentUpdate($event, index, 'body')"
                :class="{'editable-field': section.isEditing}"
                title="Párrafo"
              >
                {{ section.body }}
              </p>
              
              <ul class="list-disc list-inside text-gray-600 space-y-2">
                <li v-for="(item, i) in section.features" :key="i"
                  class="flex items-center"
                >
                  <span 
                    :contenteditable="section.isEditing" 
                    @blur="handleFeatureUpdate($event, index, i)"
                    :class="{'editable-field': section.isEditing}"
                    class="flex-grow"
                  >
                    {{ item }}
                  </span>
                  <button v-if="section.isEditing" @click="removeFeature(index, i)"
                    class="text-red-500 hover:text-red-700 ml-2" title="Eliminar característica">
                    <font-awesome-icon icon="fas fa-times" class="text-sm" />
                  </button>
                </li>
                <li v-if="section.isEditing">
                  <button @click="addFeature(index)"
                    class="text-purple-dark hover:text-purple-light transition duration-150 text-sm font-medium mt-2">
                    <font-awesome-icon icon="fas fa-plus" class="mr-1" /> Añadir Característica
                  </button>
                </li>
              </ul>
            </div>

            <div class="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 overflow-hidden relative">
              <img 
                :src="section.previewUrl || section.imagen_url || '/logo2.png'" 
                alt="Imagen de sección"
                class="w-full h-full object-cover"
              >
              <div v-if="section.isEditing" class="absolute bottom-4 right-4">
                <label class="bg-purple-dark text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-lg cursor-pointer hover:bg-purple-light transition">
                  <font-awesome-icon icon="fas fa-upload" class="mr-2" />
                  Cambiar Imagen
                  <input 
                    type="file" 
                    class="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    @change="onFileSelected($event, index)"
                  >
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <div v-if="user && user.id_rol !== 1" class="text-center mt-8 mb-8">
        <button
            @click="addSection"
            title="Añadir nueva sección de instalaciones"
            :disabled="isLoading"
            class="bg-purple-dark text-white p-4 rounded-full shadow-xl hover:bg-purple-light transition duration-300 transform hover:scale-105 inline-flex items-center justify-center
                   disabled:opacity-50 disabled:cursor-not-allowed">
            
            <font-awesome-icon icon="fas fa-plus" class="text-3xl" />
        </button>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, watchEffect, computed } from 'vue'; 
import { library } from '@fortawesome/fontawesome-svg-core';
// (MODIFICADO) Añadidos iconos
import { faPencilAlt, faSave, faPlus, faTrash, faTimes, faUpload, faCheck } from '@fortawesome/free-solid-svg-icons'; 

library.add(faPencilAlt, faSave, faPlus, faTrash, faTimes, faUpload, faCheck);

definePageMeta({
  title: 'Instalaciones'
});

// --- (MODIFICADO) Tipado de la API ---
interface InstalacionSection {
    id_instalacion: number;
    title: string;
    body: string;
    features: string[];
    imagen_url: string | null; // <-- (NUEVO)
    isEditing: boolean; 
    selectedFile: File | null; // <-- (NUEVO)
    previewUrl: string | null; // <-- (NUEVO)
}

// --- (MODIFICADO) Carga de Datos y Estado ---
const user = useUser();
const { upload } = useCloudinaryUpload(); // <-- (NUEVO)
const sections: Ref<InstalacionSection[]> = ref([]);
const isLoading = ref(false); 
const feedbackMessage = ref('');
const isError = ref(false);

const { data, pending, error, refresh } = await useAsyncData<InstalacionSection[]>(
  'lista-instalaciones',
  () => $fetch('/api/instalaciones') 
);

// (NUEVO) Variable para saber si CUALQUIER tarjeta está en modo edición
const isAnyEditing = computed(() => sections.value.some(s => s.isEditing));

// (MODIFICADO) Poblar el ref local
watchEffect(() => {
  if (data.value) {
    sections.value = data.value.map(section => ({
      ...section,
      isEditing: false,
      selectedFile: null,
      previewUrl: null
    }));
  }
});

// --- (NUEVO) Manejador de Archivo ---
const onFileSelected = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0] && sections.value[index]) {
        const file = target.files[0];
        sections.value[index].selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target) {
              sections.value[index].previewUrl = loadEvent.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    }
};

// --- Funciones de Edición (Modificadas) ---
const editCard = (index: number) => {
    if (!sections.value?.[index]) return; 
    sections.value[index].isEditing = true;
};
const handleContentUpdate = (event: Event, index: number, field: 'title' | 'body') => {
    const target = event.target as HTMLElement;
    const newContent = target.innerText.trim();
    if (sections.value[index]) {
      sections.value[index][field] = newContent;
    }
};
const handleFeatureUpdate = (event: Event, sectionIndex: number, featureIndex: number) => {
    const target = event.target as HTMLElement;
    const newContent = target.innerText.trim();
    if (sections.value[sectionIndex]?.features[featureIndex] !== undefined) {
      if (!newContent) {
        removeFeature(sectionIndex, featureIndex);
      } else {
        sections.value[sectionIndex].features[featureIndex] = newContent;
      }
    }
};
const addFeature = (sectionIndex: number) => {
    if (sections.value[sectionIndex]) {
      sections.value[sectionIndex].features.push('Nueva Característica');
    }
};
const removeFeature = (sectionIndex: number, featureIndex: number) => {
    if (sections.value[sectionIndex]?.features[featureIndex] !== undefined) {
      sections.value[sectionIndex].features.splice(featureIndex, 1);
    }
};

// (MODIFICADO) Función 'Save' llama a la API PUT (con imagen)
const saveCard = async (index: number) => {
    const section = sections.value[index];
    if (!section) return;
    
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    let finalImageUrl = section.imagen_url; 
    
    try {
      // 1. (NUEVO) Si se seleccionó un archivo nuevo, subirlo
      if (section.selectedFile) {
        feedbackMessage.value = 'Subiendo nueva imagen...';
        const newUrl = await upload(section.selectedFile);
        if (!newUrl) {
          throw new Error('Error al subir la imagen a Cloudinary.');
        }
        finalImageUrl = newUrl; 
      }

      // 2. Guardar en la BD
      await $fetch('/api/admin/instalacion', {
        method: 'PUT',
        body: {
          id_instalacion: section.id_instalacion,
          title: section.title,
          body: section.body,
          features: section.features,
          imagen_url: finalImageUrl 
        }
      });
      
      // 3. Actualizar estado local
      section.isEditing = false;
      section.imagen_url = finalImageUrl;
      section.selectedFile = null;
      section.previewUrl = null;
      feedbackMessage.value = '¡Sección guardada con éxito!';
      
    } catch (err: any) {
      isError.value = true;
      feedbackMessage.value = err.data?.statusMessage || err.message || 'Error al guardar.';
    } finally {
      isLoading.value = false;
    }
};

// (MODIFICADO) Función 'addSection' llama a la API POST
const addSection = async () => {
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    try {
      await $fetch('/api/admin/instalacion', {
        method: 'POST',
        body: { 
          title: 'Título de la Nueva Sección',
          body: 'Añade una descripción aquí.',
          features: ['Característica 1']
        }
      });
      feedbackMessage.value = 'Sección añadida. Refrescando...';
      refresh(); 
    } catch (err: any) {
      isError.value = true;
      feedbackMessage.value = err.data?.statusMessage || 'Error al crear la sección.';
    } finally {
      isLoading.value = false;
    }
};

// (MODIFICADO) Función 'removeSection' llama a la API DELETE
const removeSection = async (index: number) => {
    if (!sections.value[index]) return; 
    const section = sections.value[index];
    if (!confirm(`ADVERTENCIA: ¿Estás seguro de eliminar la sección "${section.title}"?`)) {
      return;
    }
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    try {
      await $fetch('/api/admin/instalacion', {
        method: 'DELETE',
        body: { id_instalacion: section.id_instalacion } 
      });
      feedbackMessage.value = 'Sección eliminada. Refrescando...';
      refresh(); 
    } catch (err: any) {
      isError.value = true;
      feedbackMessage.value = err.data?.statusMessage || 'Error al eliminar.';
    } finally {
      isLoading.value = false;
    }
};

</script>

<style scoped lang="postcss">
/* (Estilos del archivo original) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-light { color: #6C3483; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.border-purple-deep { border-color: #5C2A72; }
.bg-green-600 { background-color: #059669; }
.hover\:bg-green-700:hover { background-color: #047857; }
.text-red-600 { color: #dc3545; }
.hover\:text-red-800:hover { color: #a71d2a; }
.bg-white-subtle { background-color: #F8F4FA; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.text-red-500 { color: #ef4444; }
.hover\:text-red-700:hover { color: #b91c1c; }
.bg-red-100 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.border-green-300 { border-color: #86efac; }
.text-green-500 { color: #22c55e; }
.text-gray-700 { color: #374151; }

/* (Definiciones de color para @apply) */
.outline-purple-deep { outline-color: #5C2A72; }
.bg-blue-50 { background-color: #EFF6FF; }

/* (NUEVO) Estilo para los campos editables */
.editable-field:focus {
  @apply outline-2 outline-purple-deep cursor-text bg-blue-50 p-1 rounded-md;
}
</style>