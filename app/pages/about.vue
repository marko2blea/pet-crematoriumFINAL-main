<template>
  <div class="pt-14 bg-white-subtle min-h-screen">
    
    <section class="relative h-80 flex items-center justify-center text-white px-4">
      <div class="absolute inset-0 bg-black opacity-40 z-10"></div>
      <div class="absolute inset-0 z-0">
          <img src="/fondo nosotros.jpg" alt="Fondo Sobre Nosotros" class="w-full h-full object-cover">
      </div>
      <div class="relative z-20 max-w-3xl text-center">
          <img src="/logo2.png" alt="Logo Crematorio" class="w-24 mx-auto mb-4 bg-white p-2 rounded-full shadow-lg">
          <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
              Sobre Nosotros
          </h1>
          <p class="text-xl md:text-2xl font-light" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
              Conoce nuestro compromiso y valores.
          </p>
      </div>
    </section>

    

    <div class="container mx-auto px-4 py-16 space-y-16">
      
      <div v-if="feedbackMessage" 
          :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
          class="p-4 rounded-lg border text-sm font-medium text-center max-w-4xl mx-auto">
          {{ feedbackMessage }}
      </div>

      <div v-if="pending" class="text-center py-10 bg-white rounded-xl shadow-md">
          <p class="text-xl text-gray-600 font-semibold">Cargando contenido...</p>
      </div>
      <div v-else-if="error" class="text-center py-10 bg-red-100 rounded-xl shadow-md">
          <p class="text-xl text-red-700 font-semibold">Error al cargar: {{ error.statusMessage }}</p>
      </div>
      <div v-else-if="contentBlocks.length === 0" class="text-center py-10 bg-white rounded-xl shadow-md">
          <p class="text-xl text-gray-600 font-semibold">No hay contenido que mostrar. Un administrador puede añadirlo.</p>
      </div>

      <section 
        v-for="(block, index) in contentBlocks" 
        :key="block.id_block"
        class="bg-white rounded-xl shadow-2xl overflow-hidden relative"
        :class="block.isEditing ? 'border-2 border-dashed border-purple-deep' : 'border border-gray-200'"
      >
        <div v-if="user && user.id_rol !== 1" class="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <button 
                @click="block.isEditing ? saveBlock(index) : editBlock(index)"
                class="text-white transition duration-150 p-2 rounded-full shadow-md w-12 h-12"
                :class="block.isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-dark hover:bg-purple-light'"
                :title="block.isEditing ? 'Guardar Cambios' : 'Editar Bloque'">
                <font-awesome-icon :icon="block.isEditing ? 'fas fa-save' : 'fas fa-pencil-alt'" class="text-xl" />
            </button>
            <button v-if="!block.isEditing" @click="removeBlock(index)"
              class="text-red-600 bg-white hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-gray-100 w-12 h-12 shadow-md"
              title="Eliminar este bloque">
              <font-awesome-icon icon="fas fa-trash" class="text-xl" />
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            
            <div 
              class="h-80 bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden relative"
              :class="{ 'md:order-last': index % 2 === 0 }"
            >
              <img 
                :src="block.previewUrl || block.imagen_url || '/logo2.png'" 
                alt="Imagen de sección"
                class="w-full h-full object-cover"
              >
              <div v-if="block.isEditing" class="absolute bottom-4 right-4">
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

            <div class="p-8 md:p-12" :class="{ 'md:order-first': index % 2 === 0 }">
              <h2 
                class="text-3xl font-bold text-purple-dark mb-4"
                :contenteditable="block.isEditing"
                @blur="handleContentUpdate($event, index, 'title')"
                :class="{'editable-field': block.isEditing}"
              >
                {{ block.title }}
              </h2>

              <p 
                class="text-lg text-gray-700 leading-relaxed mb-6"
                :contenteditable="block.isEditing"
                @blur="handleContentUpdate($event, index, 'body')"
                :class="{'editable-field': block.isEditing}"
              >
                {{ block.body }}
              </p>
              
              <ul v-if="block.items.length > 0" class="space-y-3 text-lg">
                <li v-for="(item, i) in block.items" :key="i" class="flex items-start">
                  <font-awesome-icon icon="fas fa-check" class="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span 
                    :contenteditable="block.isEditing" 
                    @blur="handleItemUpdate($event, index, i)"
                    :class="{'editable-field': block.isEditing}"
                    class="flex-grow text-gray-700"
                  >
                    {{ item }}
                  </span>
                  <button v-if="block.isEditing" @click="removeItem(index, i)"
                    class="text-red-500 hover:text-red-700 ml-2" title="Eliminar ítem">
                    <font-awesome-icon icon="fas fa-times" class="text-sm" />
                  </button>
                </li>
              </ul>
              <button v-if="block.isEditing && block.title.toLowerCase().includes('valores')" @click="addItem(index)"
                class="text-purple-dark hover:text-purple-light transition duration-150 text-sm font-medium mt-4">
                <font-awesome-icon icon="fas fa-plus" class="mr-1" /> Añadir Ítem
              </button>
            </div>
        </div>
      </section>

      <div v-if="user && user.id_rol !== 1" class="text-center mt-16 mb-8">
          <button
              @click="addBlock"
              title="Añadir nuevo bloque de contenido"
              :disabled="isLoading"
              class="bg-purple-dark text-white p-4 rounded-full shadow-xl hover:bg-purple-light transition duration-300 transform hover:scale-105 inline-flex items-center justify-center
                    disabled:opacity-50 disabled:cursor-not-allowed">
              <font-awesome-icon icon="fas fa-plus" class="text-3xl" />
          </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, watchEffect } from 'vue'; 
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPencilAlt, faSave, faPlus, faTrash, faTimes, faCheck, faUpload } from '@fortawesome/free-solid-svg-icons'; 

library.add(faPencilAlt, faSave, faPlus, faTrash, faTimes, faCheck, faUpload);

definePageMeta({
  title: 'Sobre Nosotros'
});

// --- Tipado de la API + UI ---
interface AboutBlock {
    id_block: number;
    title: string;
    body: string;
    items: string[];
    imagen_url: string | null;
    isEditing: boolean; 
    selectedFile: File | null;
    previewUrl: string | null;
}

// --- Carga de Datos y Estado ---
const user = useUser();
const { upload } = useCloudinaryUpload();
const contentBlocks: Ref<AboutBlock[]> = ref([]); 
const isLoading = ref(false); 
const feedbackMessage = ref('');
const isError = ref(false);

const { data, pending, error, refresh } = await useAsyncData<AboutBlock[]>(
  'lista-about-content',
  () => $fetch('/api/about-content') 
);

watchEffect(() => {
  if (data.value) {
    contentBlocks.value = data.value.map(block => ({
      ...block,
      isEditing: false,
      selectedFile: null,
      previewUrl: null
    }));
  }
});

// --- (CORREGIDO) Manejador de Archivo ---
const onFileSelected = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0] && contentBlocks.value[index]) {
        const file = target.files[0];
        contentBlocks.value[index].selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            // (CORREGIDO) 'loadEvent.target' es el FileReader, su 'result' es lo que queremos
            if (loadEvent.target) {
              contentBlocks.value[index].previewUrl = loadEvent.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    }
};

// --- Funciones de Edición ---
const editBlock = (index: number) => {
    if (!contentBlocks.value?.[index]) return; 
    contentBlocks.value[index].isEditing = true;
};
const handleContentUpdate = (event: Event, index: number, field: 'title' | 'body') => {
    const target = event.target as HTMLElement;
    const newContent = target.innerText.trim();
    if (contentBlocks.value[index]) {
      contentBlocks.value[index][field] = newContent;
    }
};
const handleItemUpdate = (event: Event, blockIndex: number, itemIndex: number) => {
    const target = event.target as HTMLElement;
    const newContent = target.innerText.trim();
    if (contentBlocks.value[blockIndex]?.items[itemIndex] !== undefined) {
      if (!newContent) {
        removeItem(blockIndex, itemIndex);
      } else {
        contentBlocks.value[blockIndex].items[itemIndex] = newContent;
      }
    }
};
const addItem = (blockIndex: number) => {
    if (contentBlocks.value[blockIndex]) {
      contentBlocks.value[blockIndex].items.push('Nuevo ítem');
    }
};
const removeItem = (blockIndex: number, itemIndex: number) => {
    if (contentBlocks.value[blockIndex]?.items[itemIndex] !== undefined) {
      contentBlocks.value[blockIndex].items.splice(itemIndex, 1);
    }
};

// Función 'Save'
const saveBlock = async (index: number) => {
    const block = contentBlocks.value[index];
    if (!block) return;
    
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    let finalImageUrl = block.imagen_url; 

    try {
      if (block.selectedFile) {
        feedbackMessage.value = 'Subiendo nueva imagen...';
        const newUrl = await upload(block.selectedFile);
        if (!newUrl) {
          throw new Error('Error al subir la imagen a Cloudinary.');
        }
        finalImageUrl = newUrl; 
      }

      await $fetch('/api/admin/about-content', {
        method: 'PUT',
        body: { 
          id_block: block.id_block,
          title: block.title,
          body: block.body,
          items: block.items,
          imagen_url: finalImageUrl 
        }
      });
      
      block.isEditing = false;
      block.imagen_url = finalImageUrl;
      block.selectedFile = null;
      block.previewUrl = null;
      feedbackMessage.value = '¡Bloque guardado con éxito!';
      
    } catch (err: any) {
      isError.value = true;
      feedbackMessage.value = err.data?.statusMessage || err.message || 'Error al guardar.';
    } finally {
      isLoading.value = false;
    }
};

// Función 'addBlock'
const addBlock = async () => {
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    try {
      await $fetch('/api/admin/about-content', {
        method: 'POST',
        body: { title: 'Nuevo Bloque', body: 'Añade una descripción aquí.', items: [] }
      });
      feedbackMessage.value = 'Bloque añadido. Refrescando...';
      refresh(); 
    } catch (err: any) {
      isError.value = true;
      feedbackMessage.value = err.data?.statusMessage || 'Error al crear el bloque.';
    } finally {
      isLoading.value = false;
    }
};

// Función 'removeBlock'
const removeBlock = async (index: number) => {
    if (!contentBlocks.value[index]) return; 
    const block = contentBlocks.value[index];
    if (!confirm(`¿Estás seguro de eliminar el bloque "${block.title}"?`)) {
      return;
    }
    isLoading.value = true;
    feedbackMessage.value = '';
    isError.value = false;
    try {
      await $fetch('/api/admin/about-content', {
        method: 'DELETE',
        body: { id_block: block.id_block } 
      });
      feedbackMessage.value = 'Bloque eliminado. Refrescando...';
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
/* (Estilos de la paleta de colores) */
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.border-purple-dark { border-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-light { color: #6C3483; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.border-purple-deep { border-color: #5C2A72; }
.bg-white-subtle { background-color: #F8F4FA; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-green-600 { background-color: #059669; }
.hover\:bg-green-700:hover { background-color: #047857; }
.text-red-600 { color: #dc3545; }
.hover\:text-red-800:hover { color: #a71d2a; }
.text-red-500 { color: #ef4444; }
.hover\:text-red-700:hover { color: #b91c1c; }
.bg-red-100 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
.border-red-300 { border-color: #fca5a5; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.text-green-500 { color: #22c55e; }
.border-green-300 { border-color: #86efac; }
.text-gray-700 { color: #374151; }

/* (Definiciones de color para @apply) */
.outline-purple-deep { outline-color: #5C2A72; }
.bg-blue-50 { background-color: #EFF6FF; }

/* (NUEVO) Estilo para los campos editables */
.editable-field:focus {
  @apply outline-2 outline-purple-deep cursor-text bg-blue-50 p-1 rounded-md;
}
</style>