<template>
  <div class="pt-14 bg-white-subtle min-h-screen">
    <!-- HERO con mismas animaciones que el index -->
    <section class="relative h-80 flex items-center justify-center text-white px-4">
      <div class="absolute inset-0 bg-black opacity-40 z-10"></div>
      <div class="absolute inset-0 z-0">
        <img src="/phhh.jpg" alt="Fondo Sobre Nosotros" class="w-full h-full object-cover">
      </div>
      <div class="relative z-20 max-w-3xl text-center">
        <img
          src="/logo.png"
          alt="Logo Crematorio"
          class="w-24 mx-auto mb-4 bg-white p-2 rounded-full shadow-lg animate-fade-in"
        >
        <h1
          class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight animate-slide-in-top"
          style="text-shadow: 2px 2px 4px rgba(0,0,0,0.7);"
        >
          Sobre Nosotros
        </h1>
        <p
          class="text-xl md:text-2xl font-light animate-slide-in-bottom"
          style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);"
        >
          Conoce nuestro compromiso y valores.
        </p>
      </div>
    </section>

    <div class="container mx-auto px-4 py-16 space-y-16">
      <!-- Mensajes de feedback -->
      <div
        v-if="feedbackMessage"
        :class="isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'"
        class="p-4 rounded-lg border text-sm font-medium text-center max-w-4xl mx-auto"
      >
        {{ feedbackMessage }}
      </div>

      <!-- Estados de carga / error -->
      <div v-if="pending" class="text-center py-10 bg-white rounded-xl shadow-md">
        <p class="text-xl text-gray-600 font-semibold">Cargando contenido...</p>
      </div>
      <div v-else-if="error" class="text-center py-10 bg-red-100 rounded-xl shadow-md">
        <p class="text-xl text-red-700 font-semibold">
          Error al cargar: {{ error.statusMessage }}
        </p>
      </div>
      <div
        v-else-if="contentBlocks.length === 0"
        class="text-center py-10 bg-white rounded-xl shadow-md"
      >
        <p class="text-xl text-gray-600 font-semibold">
          No hay contenido que mostrar. Un administrador puede añadirlo.
        </p>
      </div>

      <!-- BLOQUES ABOUT -->
      <section
        v-for="(block, index) in contentBlocks"
        :key="block.id_block"
        class="bg-white rounded-xl shadow-2xl overflow-hidden relative"
        :class="block.isEditing ? 'border-2 border-dashed border-purple-deep' : 'border border-gray-200'"
      >
        <!-- Botones solo para admin/empleado (id_rol != 1) -->
        <div
          v-if="user && user.id_rol !== 1"
          class="absolute top-4 right-4 flex items-center space-x-2 z-10"
        >
          <button
            @click="block.isEditing ? saveBlock(index) : editBlock(index)"
            class="text-white transition duration-150 p-2 rounded-full shadow-md w-12 h-12"
            :class="block.isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-dark hover:bg-purple-light'"
            :title="block.isEditing ? 'Guardar Cambios' : 'Editar Bloque'"
          >
            <font-awesome-icon
              :icon="block.isEditing ? 'fas fa-save' : 'fas fa-pencil-alt'"
              class="text-xl"
            />
          </button>
          <button
            v-if="!block.isEditing"
            @click="removeBlock(index)"
            class="text-red-600 bg-white hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-gray-100 w-12 h-12 shadow-md"
            title="Eliminar este bloque"
          >
            <font-awesome-icon icon="fas fa-trash" class="text-xl" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
          <!-- Imagen -->
          <div
            class="h-80 bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden relative"
            :class="{ 'md:order-last': index % 2 === 0 }"
          >
            <img
              :src="block.imagen_url || '/logo2.png'"
              alt="Imagen de sección"
              class="w-full h-full object-cover"
            />

            <!-- Overlay con input de URL de imagen cuando está en modo edición -->
            <div
              v-if="block.isEditing"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <div class="w-full">
                <label for="about-url-input" class="sr-only">URL de la Imagen</label>
                <input
                  type="url"
                  id="about-url-input"
                  v-model="block.imagen_url"
                  placeholder="Pegar URL de la Imagen (ej: https://ejemplo.com/img.jpg)"
                  class="w-full p-2 border-2 border-white rounded-md text-gray-800 focus:ring-purple-light focus:border-purple-light"
                  title="Pegar la URL pública de la imagen"
                />
              </div>
            </div>
          </div>

          <!-- Texto -->
          <div class="p-8 md:p-12" :class="{ 'md:order-first': index % 2 === 0 }">
            <h2
              class="text-3xl font-bold text-purple-dark mb-4"
              :contenteditable="block.isEditing"
              @blur="handleContentUpdate($event, index, 'title')"
              :class="{ 'editable-field': block.isEditing }"
            >
              {{ block.title }}
            </h2>

            <p
              class="text-lg text-gray-700 leading-relaxed mb-6"
              :contenteditable="block.isEditing"
              @blur="handleContentUpdate($event, index, 'body')"
              :class="{ 'editable-field': block.isEditing }"
            >
              {{ block.body }}
            </p>

            <ul
              v-if="block.items && block.items.length > 0"
              class="space-y-3 text-lg"
            >
              <li
                v-for="(item, i) in block.items"
                :key="i"
                class="flex items-start"
              >
                <font-awesome-icon
                  icon="fas fa-check"
                  class="text-green-500 mr-3 mt-1 flex-shrink-0"
                />
                <span
                  :contenteditable="block.isEditing"
                  @blur="handleItemUpdate($event, index, i)"
                  :class="{ 'editable-field': block.isEditing }"
                  class="flex-grow text-gray-700"
                >
                  {{ item }}
                </span>
                <button
                  v-if="block.isEditing"
                  @click="removeItem(index, i)"
                  class="text-red-500 hover:text-red-700 ml-2"
                  title="Eliminar ítem"
                >
                  <font-awesome-icon icon="fas fa-times" class="text-sm" />
                </button>
              </li>
            </ul>

            <button
              v-if="block.isEditing && block.title.toLowerCase().includes('valores')"
              @click="addItem(index)"
              class="text-purple-dark hover:text-purple-light transition duration-150 text-sm font-medium mt-4"
            >
              <font-awesome-icon icon="fas fa-plus" class="mr-1" /> Añadir Ítem
            </button>
          </div>
        </div>
      </section>

      <!-- Botón para añadir nuevo bloque -->
      <div
        v-if="user && user.id_rol !== 1"
        class="text-center mt-16 mb-8"
      >
        <button
          @click="addBlock"
          title="Añadir nuevo bloque de contenido"
          :disabled="isLoading"
          class="bg-purple-dark text-white p-4 rounded-full shadow-xl hover:bg-purple-light transition duration-300 transform hover:scale-105 inline-flex items-center justify-center
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <font-awesome-icon icon="fas fa-plus" class="text-3xl" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, watchEffect } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPencilAlt,
  faSave,
  faPlus,
  faTrash,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

library.add(faPencilAlt, faSave, faPlus, faTrash, faTimes, faCheck);

definePageMeta({
  title: 'Sobre Nosotros'
});

// Tipado de bloques About
interface AboutBlock {
  id_block: number;
  title: string;
  body: string;
  items: string[];
  imagen_url: string | null;
  isEditing: boolean;
}

const user = useUser();
const contentBlocks: Ref<AboutBlock[]> = ref([]);
const isLoading = ref(false);
const feedbackMessage = ref('');
const isError = ref(false);

const { data, pending, error, refresh } = await useAsyncData<AboutBlock[]>(
  'lista-about-content',
  () => $fetch('/api/about-content')
);

// Sincronizar data de la API con el estado local
watchEffect(() => {
  if (data.value) {
    contentBlocks.value = data.value.map((block) => ({
      ...block,
      isEditing: false
    }));
  }
});

// --- Funciones de edición ---
const editBlock = (index: number) => {
  const block = contentBlocks.value[index];
  if (!block) return;
  block.isEditing = true;
};

const handleContentUpdate = (
  event: Event,
  index: number,
  field: 'title' | 'body'
) => {
  const target = event.target as HTMLElement;
  const newContent = target.innerText.trim();
  const block = contentBlocks.value[index];
  if (!block) return;
  block[field] = newContent;
};

const handleItemUpdate = (
  event: Event,
  blockIndex: number,
  itemIndex: number
) => {
  const target = event.target as HTMLElement;
  const newContent = target.innerText.trim();
  const block = contentBlocks.value[blockIndex];
  if (!block || block.items[itemIndex] === undefined) return;

  if (!newContent) {
    removeItem(blockIndex, itemIndex);
  } else {
    block.items[itemIndex] = newContent;
  }
};

const addItem = (blockIndex: number) => {
  const block = contentBlocks.value[blockIndex];
  if (!block) return;
  block.items.push('Nuevo ítem');
};

const removeItem = (blockIndex: number, itemIndex: number) => {
  const block = contentBlocks.value[blockIndex];
  if (!block || block.items[itemIndex] === undefined) return;
  block.items.splice(itemIndex, 1);
};

// Guardar un bloque (PUT)
const saveBlock = async (index: number) => {
  const block = contentBlocks.value[index];
  if (!block) return;

  isLoading.value = true;
  feedbackMessage.value = '';
  isError.value = false;

  try {
    await $fetch('/api/admin/about-content', {
      method: 'PUT',
      body: {
        id_block: block.id_block,
        title: block.title,
        body: block.body,
        items: block.items,
        imagen_url: block.imagen_url
      }
    });

    block.isEditing = false;
    feedbackMessage.value = '¡Bloque guardado con éxito!';
  } catch (err: any) {
    console.error(err);
    isError.value = true;
    feedbackMessage.value =
      err?.data?.statusMessage || err?.message || 'Error al guardar.';
  } finally {
    isLoading.value = false;
  }
};

// Añadir nuevo bloque (POST)
const addBlock = async () => {
  if (!user.value || user.value.id_rol === 1) return;

  isLoading.value = true;
  feedbackMessage.value = '';
  isError.value = false;

  try {
    const payload = {
      title: 'Nuevo bloque',
      body: 'Texto de ejemplo. Haz clic en el lápiz para editar este contenido.',
      items: [] as string[],
      imagen_url: null as string | null
    };

    const response: any = await $fetch('/api/admin/about-content', {
      method: 'POST',
      body: payload
    });

    const created = response.block || response;

    const nuevoBloque: AboutBlock = {
      id_block: created.id_block,
      title: created.title,
      body: created.body,
      items: created.items || [],
      imagen_url: created.imagen_url || null,
      isEditing: true
    };

    contentBlocks.value.push(nuevoBloque);
    feedbackMessage.value = 'Nuevo bloque añadido. Ahora puedes editarlo.';
  } catch (err: any) {
    console.error(err);
    isError.value = true;
    feedbackMessage.value =
      err?.data?.statusMessage || err?.message || 'Error al añadir el bloque.';
  } finally {
    isLoading.value = false;
  }
};

// Eliminar bloque (DELETE)
const removeBlock = async (index: number) => {
  const block = contentBlocks.value[index];
  if (!block) return;

  if (
    !confirm(
      `¿Seguro que deseas eliminar el bloque "${block.title}"? Esta acción no se puede deshacer.`
    )
  ) {
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

    contentBlocks.value.splice(index, 1);
    feedbackMessage.value = 'Bloque eliminado correctamente.';
  } catch (err: any) {
    console.error(err);
    isError.value = true;
    feedbackMessage.value =
      err?.data?.statusMessage || err?.message || 'Error al eliminar el bloque.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="postcss">
/* 🔥 Animaciones iguales que el index.vue */
@keyframes slide-in-top {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-slide-in-top { animation: slide-in-top 0.8s ease forwards; }
.animate-slide-in-bottom { animation: slide-in-top 0.8s ease 0.3s forwards; }
.animate-fade-in { animation: slide-in-top 0.8s ease 0.6s forwards; }

/* Colores y utilidades */
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
.outline-purple-deep { outline-color: #5C2A72; }
.bg-blue-50 { background-color: #EFF6FF; }

/* Campos editables */
.editable-field:focus {
  @apply outline-2 outline-purple-deep cursor-text bg-blue-50 p-1 rounded-md;
}
</style>
