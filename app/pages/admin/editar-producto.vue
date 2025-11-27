<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    <!-- Cargando -->
    <div
      v-if="cargando"
      class="max-w-3xl mx-auto text-center bg-white rounded-xl shadow-2xl p-10"
    >
      <p class="text-lg font-semibold text-gray-600">
        Cargando datos del producto...
      </p>
    </div>

    <!-- Error al cargar -->
    <div
      v-else-if="loadError"
      class="max-w-3xl mx-auto text-center bg-red-100 rounded-xl shadow-2xl p-10 border border-red-300"
    >
      <p class="text-lg font-semibold text-red-700">
        {{ loadError }}
      </p>
      <button
        class="mt-4 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        @click="router.push('/admin/inventario')"
      >
        Volver al Inventario
      </button>
    </div>

    <!-- Formulario -->
    <form
      v-else
      @submit.prevent="guardarCambios"
      class="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-purple-dark animate-fade-in"
    >
      <div class="p-6 bg-gray-50 border-b border-gray-200">
        <h1 class="text-3xl font-bold text-purple-dark">Editar Producto</h1>
        <p class="text-lg text-gray-600 mt-1">
          Actualiza los datos del producto seleccionado.
        </p>
      </div>

      <!-- Mensaje de guardado -->
      <div
        v-if="saveMessage"
        :class="
          saveError
            ? 'bg-red-100 text-red-700 border-red-300'
            : 'bg-green-100 text-green-700 border-green-300'
        "
        class="m-6 p-4 rounded-lg border text-sm font-medium text-center animate-fade-in"
      >
        {{ saveMessage }}
      </div>

      <div class="p-6 md:p-8 space-y-6">
        <!-- Nombre + Tipo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="nombre"
              class="block text-sm font-semibold text-dark-primary-blue mb-2"
            >
              Nombre del Ítem
            </label>
            <input
              v-model.trim="form.nombre"
              type="text"
              id="nombre"
              class="form-input"
              required
            />
          </div>

          <div>
            <label
              for="tipo"
              class="block text-sm font-semibold text-dark-primary-blue mb-2"
            >
              Tipo
            </label>
            <select
              v-model="form.tipo"
              id="tipo"
              class="form-input bg-white"
            >
              <option value="Servicio">Servicio</option>
              <option value="Urna">Urna</option>
              <option value="Accesorio">Accesorio</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <!-- Stock / Precio / Disponibilidad -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-if="isPhysicalProduct">
            <label
              for="stock"
              class="block text-sm font-semibold text-dark-primary-blue mb-2"
            >
              Stock
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              id="stock"
              class="form-input"
              min="0"
              required
            />
          </div>

          <div :class="isPhysicalProduct ? '' : 'md:col-span-2'">
            <label
              for="precio"
              class="block text-sm font-semibold text-dark-primary-blue mb-2"
            >
              Precio Unitario (CLP)
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                >$</span
              >
              <input
                v-model.number="form.precio"
                type="number"
                id="precio"
                class="form-input pl-7"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label
              for="disponible"
              class="block text-sm font-semibold text-dark-primary-blue mb-2"
            >
              Disponibilidad
            </label>
            <select
              v-model="form.disponible"
              id="disponible"
              class="form-input bg-white"
            >
              <option :value="true">Disponible</option>
              <option :value="false">Agotado / No Disponible</option>
            </select>
          </div>
        </div>

        <!-- Descripción -->
        <div>
          <label
            for="descripcion"
            class="block text-sm font-semibold text-dark-primary-blue mb-2"
          >
            Descripción
          </label>
          <textarea
            v-model.trim="form.descripcion"
            id="descripcion"
            rows="3"
            class="form-input"
          ></textarea>
        </div>

        <!-- Imagen -->
        <div>
          <label
            for="imagen_url"
            class="block text-sm font-semibold text-dark-primary-blue mb-2"
          >
            URL de Imagen
          </label>
          <input
            v-model.trim="form.imagen_url"
            type="text"
            id="imagen_url"
            class="form-input"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p v-if="form.imagen_url" class="mt-2 text-xs text-gray-500">
            Vista previa (si la URL es válida):
          </p>
          <div
            v-if="form.imagen_url"
            class="mt-2 w-full h-40 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50"
          >
            <img
              :src="form.imagen_url"
              alt="Vista previa"
              class="max-h-full object-contain"
              @error="onImageError"
            />
          </div>
        </div>

        <!-- Proveedor -->
        <div v-if="isPhysicalProduct">
          <label
            for="proveedor"
            class="block text-sm font-semibold text-dark-primary-blue mb-2"
          >
            Proveedor
          </label>
          <select
            v-model="form.id_proveedor"
            id="proveedor"
            class="form-input bg-white"
          >
            <option :value="null">-- Sin Proveedor --</option>
            <option v-if="pendingProveedores">Cargando proveedores...</option>
            <option
              v-for="p in proveedores"
              :key="p.id_proveedor"
              :value="p.id_proveedor"
            >
              {{ p.proveedor }}
            </option>
          </select>
        </div>
      </div>

      <!-- Botones -->
      <div
        class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3"
      >
        <button
          type="button"
          @click="router.push('/admin/inventario')"
          class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-5 py-2 bg-purple-deep text-white rounded-lg hover:bg-purple-light transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

definePageMeta({
  middleware: 'admin'
});

interface Proveedor {
  id_proveedor: number;
  proveedor: string | null;
}

interface ProductoAPI {
  cod_producto: number;
  nombre_producto: string | null;
  stock_actual: number | null;
  precio_unitario: number | string | null;
  disponible: boolean | null;
  tipo_producto: string | null;
  id_proveedor: number | null;
  descripcion: string | null;
  imagen_url: string | null;
}

const router = useRouter();
const route = useRoute();

const cargando = ref(true);
const loadError = ref<string | null>(null);

const form = ref({
  cod_producto: 0,
  nombre: '',
  stock: 0,
  precio: 0,
  disponible: true as boolean,
  tipo: 'Urna',
  id_proveedor: null as number | null,
  descripcion: '',
  imagen_url: ''
});

const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

// Proveedores
const { data: proveedores, pending: pendingProveedores } =
  await useAsyncData<Proveedor[]>('lista-proveedores', () =>
    $fetch('/api/admin/proveedores')
  );

// Servicio vs producto físico
const isPhysicalProduct = computed(() => form.value.tipo !== 'Servicio');

// Cargar producto desde la API según cod_producto
onMounted(async () => {
  const idParam = route.query.id as string | undefined;

  if (!idParam || isNaN(Number(idParam))) {
    loadError.value = 'ID de producto inválido o no proporcionado.';
    cargando.value = false;
    return;
  }

  try {
    const data = await $fetch<ProductoAPI>('/api/admin/producto-detalle', {
      method: 'GET',
      query: { id: idParam } // aquí el backend debe usar este id como cod_producto
    });

    if (!data) {
      loadError.value = 'No se encontró el producto solicitado.';
      cargando.value = false;
      return;
    }

    form.value.cod_producto = data.cod_producto;
    form.value.nombre = data.nombre_producto || '';
    form.value.tipo = data.tipo_producto || 'Urna';
    form.value.stock = data.stock_actual ?? 0;
    form.value.precio = data.precio_unitario
      ? Number(data.precio_unitario)
      : 0;
    form.value.disponible = data.disponible ?? true;
    form.value.id_proveedor = data.id_proveedor;
    form.value.descripcion = data.descripcion || '';
    form.value.imagen_url = data.imagen_url || '';
  } catch (err: any) {
    console.error('Error cargando producto:', err);
    loadError.value =
      err?.data?.statusMessage ||
      'Error al cargar los datos del producto. Verifique el ID.';
  } finally {
    cargando.value = false;
  }
});

const onImageError = () => {
  // Si la imagen falla, limpiamos la URL para que no moleste visualmente
  form.value.imagen_url = '';
};

const guardarCambios = async () => {
  if (!form.value.cod_producto) return;

  saveMessage.value = '';
  saveError.value = false;

  const dataToSend: any = {
    cod_producto: form.value.cod_producto,
    nombre: form.value.nombre,
    stock: form.value.stock,
    precio: form.value.precio,
    disponible: form.value.disponible,
    tipo: form.value.tipo,
    id_proveedor: form.value.id_proveedor,
    descripcion: form.value.descripcion,
    imagen_url: form.value.imagen_url
  };

  // Si ahora es Servicio → sin stock ni proveedor
  if (!isPhysicalProduct.value) {
    dataToSend.stock = 0;
    dataToSend.id_proveedor = null;
  }

  // Normalizar campos vacíos
  if (!dataToSend.imagen_url || dataToSend.imagen_url.trim() === '') {
    dataToSend.imagen_url = null;
  }
  if (!dataToSend.descripcion || dataToSend.descripcion.trim() === '') {
    dataToSend.descripcion = null;
  }

  isSaving.value = true;

  try {
    await $fetch('/api/admin/editar-producto', {
      method: 'PUT',
      body: dataToSend
    });

    saveMessage.value = '✔ Producto actualizado con éxito.';
    saveError.value = false;

    setTimeout(() => {
      router.push('/admin/inventario');
    }, 1200);
  } catch (err: any) {
    console.error('Error al actualizar producto:', err);
    saveError.value = true;
    saveMessage.value =
      err?.data?.statusMessage || 'Error al actualizar el producto.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped lang="postcss">
.form-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600;
}
.form-input.pl-7 {
  padding-left: 1.75rem;
}

/* Colores */
.text-purple-dark {
  color: #4a235a;
}
.bg-purple-dark {
  background-color: #4a235a;
}
.text-purple-deep {
  color: #5c2a72;
}
.bg-purple-deep {
  background-color: #5c2a72;
}
.bg-purple-light {
  background-color: #6c3483;
}
.text-dark-primary-blue {
  color: #34495e;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}
.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}
.bg-green-100 {
  background-color: #d4edda;
}
.text-green-700 {
  color: #155724;
}
.border-green-300 {
  border-color: #c3e6cb;
}
.bg-red-100 {
  background-color: #f8d7da;
}
.text-red-700 {
  color: #721c24;
}
.border-red-300 {
  border-color: #f5c6cb;
}

/* Animación de entrada */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.35s ease-out;
}
</style>
