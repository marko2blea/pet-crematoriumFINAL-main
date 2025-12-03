<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-extrabold text-purple-dark mb-8 text-center">
        <font-awesome-icon icon="fas fa-shopping-cart" class="mr-3 text-purple-deep" />
        Mi Carrito
      </h1>

      <!-- Carrito vacío -->
      <div
        v-if="cart.length === 0"
        class="text-center bg-white p-10 rounded-xl shadow-lg"
      >
        <p class="text-2xl text-gray-600 mb-6">Tu carrito está vacío.</p>
        <NuxtLink
          to="/"
          class="bg-purple-deep text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-purple-light transition duration-300 transform hover:scale-105 shadow-md"
        >
          Ver Servicios y Productos
        </NuxtLink>
      </div>

      <!-- Carrito con items -->
      <div v-else>
        <!-- FORMULARIO + RESUMEN EN 2 COLUMNAS -->
        <form
          @submit.prevent="confirmPayment"
          class="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <!-- COLUMNA IZQUIERDA: Datos -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Lista de ítems con selección y cantidades -->
            <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
              <ul class="divide-y divide-gray-200">
                <li
                  v-for="item in cart"
                  :key="item.id"
                  class="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between"
                >
                  <div class="flex items-center mb-4 sm:mb-0">
                    <input
                      type="checkbox"
                      v-model="item.selected"
                      @change="onToggleItem(item)"
                      class="mr-3 w-5 h-5 text-purple-deep rounded border-gray-300 focus:ring-2 focus:ring-purple-deep"
                    />

                    <div
                      class="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <font-awesome-icon
                        :icon="getIconForProduct(item.tipo)"
                        class="text-2xl text-gray-400"
                      />
                    </div>

                    <div class="ml-4">
                      <h3 class="text-lg font-bold text-purple-dark">
                        {{ item.nombre }}
                      </h3>
                      <p class="text-sm text-gray-500">{{ item.tipo }}</p>
                      <p class="text-md font-semibold text-dark-primary-blue mt-1">
                        ${{ item.precio.toLocaleString('es-CL') }} c/u
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div class="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        @click="decreaseQuantity(item.id)"
                        class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                      >
                        <font-awesome-icon icon="fas fa-minus" class="text-sm" />
                      </button>
                      <span class="px-4 py-2 font-bold text-dark-primary-blue">
                        {{ item.quantity }}
                      </span>
                      <button
                        type="button"
                        @click="increaseQuantity(item.id)"
                        class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                      >
                        <font-awesome-icon icon="fas fa-plus" class="text-sm" />
                      </button>
                    </div>

                    <button
                      type="button"
                      @click="removeFromCart(item.id)"
                      class="text-red-500 hover:text-red-700 p-2"
                      title="Eliminar producto"
                    >
                      <font-awesome-icon icon="fas fa-trash" class="text-lg" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Datos de Mascota (si hay Servicio seleccionado) -->
            <div
              v-if="hasService"
              class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-yellow-400"
            >
              <h2 class="text-2xl font-bold text-yellow-800 mb-4 border-b pb-2">
                Datos de la Mascota (Servicio)
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    for="petName"
                    class="block text-sm font-semibold text-dark-primary-blue mb-2"
                  >
                    Nombre de la Mascota
                  </label>
                  <input
                    id="petName"
                    v-model="mascotaForm.petName"
                    type="text"
                    required
                    class="form-input"
                  />
                </div>
                <div>
                  <label
                    for="petWeight"
                    class="block text-sm font-semibold text-dark-primary-blue mb-2"
                  >
                    Peso (kg)
                  </label>
                  <input
                    id="petWeight"
                    v-model.number="mascotaForm.petWeight"
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    class="form-input"
                  />
                </div>
                <div>
                  <label
                    for="petAge"
                    class="block text-sm font-semibold text-dark-primary-blue mb-2"
                  >
                    Edad (años)
                  </label>
                  <input
                    id="petAge"
                    v-model.number="mascotaForm.petAge"
                    type="number"
                    min="0"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Logística de entrega -->
            <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark">
              <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
                Logística de Entrega
                <span class="text-sm text-gray-500">
                  ({{ hasService ? 'Retiro Mascota' : 'Entrega Producto' }})
                </span>
              </h2>

              <div class="space-y-3">
                <div class="space-y-2">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="LOCAL"
                      v-model="servicioLogistica.tipo_entrega"
                      required
                      class="form-radio text-purple-deep"
                    />
                    <span class="ml-2">
                      Retiro/Entrega en Tienda
                    </span>
                  </label>
                  <label class="inline-flex items-center ml-4">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="DOMICILIO"
                      v-model="servicioLogistica.tipo_entrega"
                      required
                      class="form-radio text-purple-deep"
                    />
                    <span class="ml-2">
                      {{ hasService ? 'Retiro de Mascota a Domicilio' : 'Envío a Domicilio' }}
                      <span
                        v-if="servicioLogistica.tipo_entrega === 'DOMICILIO'"
                        class="text-red-600 font-semibold"
                      >
                        (+ ${{ COSTO_RETIRO_DOMICILIO.toLocaleString('es-CL') }})
                      </span>
                    </span>
                  </label>
                </div>

                <div
                  v-if="servicioLogistica.tipo_entrega === 'DOMICILIO'"
                  class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label
                      for="region"
                      class="block text-sm font-semibold text-dark-primary-blue mb-2"
                    >
                      Región
                    </label>
                    <input
                      id="region"
                      v-model="servicioLogistica.region"
                      type="text"
                      required
                      class="form-input"
                    />
                  </div>
                  <div>
                    <label
                      for="comuna"
                      class="block text-sm font-semibold text-dark-primary-blue mb-2"
                    >
                      Comuna
                    </label>
                    <input
                      id="comuna"
                      v-model="servicioLogistica.comuna"
                      type="text"
                      required
                      class="form-input"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label
                      for="direccion"
                      class="block text-sm font-semibold text-dark-primary-blue mb-2"
                    >
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      v-model="servicioLogistica.direccion"
                      type="text"
                      required
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark">
              <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
                Método de Pago
              </h2>

              <div class="space-y-2">
                <label class="block items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TRANSFERENCIA"
                    v-model="pagoForm.metodoPago"
                    required
                    class="form-radio text-purple-deep"
                  />
                  <span class="ml-2 font-medium">Transferencia Bancaria</span>
                </label>
                <label class="block items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="EFECTIVO"
                    v-model="pagoForm.metodoPago"
                    required
                    class="form-radio text-purple-deep"
                  />
                  <span class="ml-2 font-medium">
                    Efectivo al Retirar / Contra Entrega
                  </span>
                </label>
                <label class="block items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="WEBPAY"
                    v-model="pagoForm.metodoPago"
                    required
                    class="form-radio text-purple-deep"
                  />
                  <span class="ml-2 font-medium">
                    Webpay Plus
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: Resumen -->
          <div class="lg:col-span-1">
            <div
              class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-bd-gold-accent sticky top-24"
            >
              <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
                Resumen del Pedido
              </h2>

              <!-- Items seleccionados -->
              <ul class="space-y-2 mb-4 max-h-60 overflow-y-auto">
                <li
                  v-for="item in cart.filter(i => i.selected)"
                  :key="item.id"
                  class="flex justify-between items-center text-sm"
                >
                  <span class="text-gray-700">
                    {{ item.nombre }} x{{ item.quantity }}
                  </span>
                  <span class="font-semibold text-dark-primary-blue">
                    ${{ (item.precio * item.quantity).toLocaleString('es-CL') }}
                  </span>
                </li>
              </ul>

              <div class="space-y-3 text-lg border-t pt-4">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold text-dark-primary-blue">
                    ${{ cartTotal.toLocaleString('es-CL') }}
                  </span>
                </div>

                <div
                  v-if="servicioLogistica.costo_retiro > 0"
                  class="flex justify-between items-center text-sm text-red-600"
                >
                  <span>Costo adicional retiro a domicilio:</span>
                  <span>
                    + ${{ servicioLogistica.costo_retiro.toLocaleString('es-CL') }}
                  </span>
                </div>

                <hr class="border-gray-300" />

                <div class="flex justify-between text-2xl font-bold text-purple-dark">
                  <span>Total a pagar:</span>
                  <span>
                    ${{ carritoTotalConRetiro.toLocaleString('es-CL') }}
                  </span>
                </div>
              </div>

              <p class="text-sm text-gray-500 text-right mt-2">
                El IVA (19%) se calcula en el backend según corresponda.
              </p>

              <button
                type="submit"
                :disabled="!selectedItems.length || isProcessing"
                class="w-full mt-6 py-3 rounded-xl font-bold text-lg bg-purple-deep text-white hover:bg-purple-light transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isProcessing ? 'Procesando...' : 'Confirmar y Pagar' }}
              </button>

              <button
                type="button"
                @click="clearCart"
                class="w-full text-center text-gray-600 hover:text-red-600 font-medium py-2 mt-3 transition duration-150"
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useCart } from '~/composables/useCart';
import { useRouter } from 'vue-router';
import { navigateTo } from '#app';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faShoppingCart,
  faTrash,
  faPlus,
  faMinus,
  faHeart,
  faBoxOpen,
  faPuzzlePiece,
  faPaw,
} from '@fortawesome/free-solid-svg-icons';

library.add(faShoppingCart, faTrash, faPlus, faMinus, faHeart, faBoxOpen, faPuzzlePiece, faPaw);

// --- CONSTANTE DE COSTO DE RETIRO ---
const COSTO_RETIRO_DOMICILIO = 15000;

// Definición de interfaces
interface Direccion {
  region: string;
  comuna: string;
  direccion: string;
  tipo_entrega: 'DOMICILIO' | 'RETIRO'; // RETIRO = LOCAL
}

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  tipo: 'Producto' | 'Servicio' | 'Urna' | 'Accesorio';
  quantity: number;
  selected: boolean;
  // Datos opcionales que se adjuntan al ítem
  petName?: string;
  petWeight?: number;
  petAge?: number;
  direccion?: Direccion;
  costo_adicional?: number; // Para el BE
}

interface PedidoResponse {
  statusCode: number;
  message: string;
  id_pedido: number;
}

interface CheckoutResponse {
  statusCode: number;
  message: string;
  codTrazabilidad: string;
}

const rawCart = useCart();
const router = useRouter();

const cart = ref<CartItem[]>([]);
const isProcessing = ref(false);

// Formularios
const mascotaForm = ref({ petName: '', petWeight: 0, petAge: 0 });
const pagoForm = ref({ metodoPago: 'TRANSFERENCIA' });

// Lógica de Retiro y Entrega
const servicioLogistica = ref({
  tipo_entrega: 'LOCAL' as 'DOMICILIO' | 'RETIRO', // runtime 'LOCAL', tipo mintiendo pero ya te funcionaba así
  region: '',
  comuna: '',
  direccion: '',
  costo_retiro: 0,
});

// Propiedades computadas
const selectedItems = computed(() =>
  cart.value.filter((item) => item.selected),
);

const hasService = computed(() =>
  selectedItems.value.some((item) => item.tipo === 'Servicio'),
);

const hasProduct = computed(() =>
  selectedItems.value.some((item) => item.tipo !== 'Servicio'),
);

// Total sin costo adicional (solo seleccionados)
const cartTotal = computed(() =>
  selectedItems.value.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0,
  ),
);

// Total con costo adicional de retiro a domicilio
const carritoTotalConRetiro = computed(() => {
  let total = cartTotal.value;
  let costo = 0;

  if (servicioLogistica.value.tipo_entrega === 'DOMICILIO') {
    costo = COSTO_RETIRO_DOMICILIO;
  }

  servicioLogistica.value.costo_retiro = costo;
  return total + costo;
});

// Sincronizar carrito global -> local (solo lectura)
watchEffect(() => {
  const base = rawCart.cart.value as any[];

  const newCart: CartItem[] = base.map((item) => {
    const existing = cart.value.find((i) => i.id === item.id);
    return {
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      tipo: item.tipo,
      quantity: item.quantity,
      selected: existing ? existing.selected : true,
      petName: existing?.petName,
      petWeight: existing?.petWeight,
      petAge: existing?.petAge,
      direccion: existing?.direccion,
      costo_adicional: existing?.costo_adicional,
    };
  });

  cart.value = newCart;

  // Asegurar solo 1 servicio seleccionado
  const serviciosSeleccionados = cart.value.filter(
    (i) => i.tipo === 'Servicio' && i.selected,
  );
  if (serviciosSeleccionados.length > 1) {
    serviciosSeleccionados.slice(1).forEach((s) => {
      s.selected = false;
    });
  }
});

// ICONOS
function getIconForProduct(tipo: string) {
  if (tipo === 'Servicio') return faHeart;
  if (tipo === 'Urna') return faBoxOpen;
  if (tipo === 'Accesorio') return faPuzzlePiece;
  return faPaw;
}

// ACCIONES DEL CARRITO (delegadas al composable)
function removeFromCart(id: number) {
  rawCart.removeFromCart(id);
}
function increaseQuantity(id: number) {
  rawCart.increaseQuantity(id);
}
function decreaseQuantity(id: number) {
  rawCart.decreaseQuantity(id);
}
function clearCart() {
  rawCart.clearCart();
}

// Selección de ítems
function onToggleItem(toggledItem: CartItem) {
  // si es servicio y se acaba de seleccionar, deseleccionar otros servicios
  if (toggledItem.tipo === 'Servicio' && toggledItem.selected) {
    cart.value.forEach((item) => {
      if (item.id !== toggledItem.id && item.tipo === 'Servicio') {
        item.selected = false;
      }
    });
  }
}

// FUNCIÓN DE CONFIRMACIÓN: Llama a la API
const confirmPayment = async () => {
  // Validar que haya al menos un item seleccionado
  if (selectedItems.value.length === 0) {
    alert('Selecciona al menos un artículo para proceder al pago.');
    return;
  }

  // Webpay aún no funcional
  if (pagoForm.value.metodoPago === 'WEBPAY') {
    alert(
      'El pago con Webpay Plus aún no está habilitado.\nPor favor, elige Transferencia o Efectivo.',
    );
    return;
  }

  // Validar datos mascota si hay servicio
  if (
    hasService.value &&
    (!mascotaForm.value.petName || !mascotaForm.value.petWeight)
  ) {
    alert('Por favor, completa los datos de la mascota.');
    return;
  }

  // Validar dirección si es domicilio
  if (
    servicioLogistica.value.tipo_entrega === 'DOMICILIO' &&
    (!servicioLogistica.value.region || !servicioLogistica.value.direccion)
  ) {
    alert(
      'Por favor, completa la dirección para el retiro/envío a domicilio.',
    );
    return;
  }

  isProcessing.value = true;

  try {
    // Preparar carrito final
    const finalCart = selectedItems.value.map((item) => {
      let newItem: CartItem = { ...item };

      // Adjuntar datos de Mascota al servicio
      if (item.tipo === 'Servicio') {
        newItem = { ...newItem, ...mascotaForm.value };
      }

      // Adjuntar Logística y Costo
      newItem.direccion = {
        region: servicioLogistica.value.region,
        comuna: servicioLogistica.value.comuna,
        direccion: servicioLogistica.value.direccion,
        tipo_entrega: servicioLogistica.value.tipo_entrega,
      };
      newItem.costo_adicional = servicioLogistica.value.costo_retiro;

      return newItem;
    });

    // TODO: Reemplazar por el usuario real
    const idUsuario = 1;

    // PASO 1: Crear el Pedido
    const pedidoResponse: PedidoResponse = await $fetch('/api/pedidos', {
      method: 'POST',
      body: {
        id_usuario: idUsuario,
        cart: finalCart,
        metodo_pago: pagoForm.value.metodoPago,
      },
    });

    if (
      pedidoResponse.statusCode !== 201 ||
      typeof pedidoResponse.id_pedido !== 'number'
    ) {
      throw new Error(pedidoResponse.message || 'Fallo al crear el pedido.');
    }

    const idPedido = pedidoResponse.id_pedido;

    // PASO 2: Simular pago exitoso (tu /api/checkout actual)
    const pagoExitosoSimulado = true;

    const checkoutResponse: CheckoutResponse = await $fetch('/api/checkout', {
      method: 'POST',
      body: {
        idPedido,
        pagoExitoso: pagoExitosoSimulado,
      },
    });

    const code = checkoutResponse.codTrazabilidad;

    if (code) {
      // Limpiar solo los ítems pagados
      selectedItems.value.forEach((s) => {
        rawCart.removeFromCart(s.id);
      });

      alert(
        `¡Compra finalizada! Código de seguimiento: ${code}. Redirigiendo...`,
      );
      await navigateTo(`/tracking?codigo=${code}`, { replace: true });
    } else {
      alert('Error: No se recibió código de seguimiento.');
    }
  } catch (error: any) {
    console.error('Error durante el proceso de pago:', error);
    alert(
      error?.data?.statusMessage ||
        error?.message ||
        'Error desconocido al procesar el pago. Intente de nuevo.',
    );
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.text-purple-dark {
  color: #4a235a;
}
.bg-purple-dark {
  background-color: #4a235a;
}
.bg-purple-light {
  background-color: #6c3483;
}
.text-purple-deep {
  color: #5c2a72;
}
.bg-purple-deep {
  background-color: #5c2a72;
}
.hover\:bg-purple-light:hover {
  background-color: #6c3483;
}
.text-dark-primary-blue {
  color: #34495e;
}
.border-bd-gold-accent {
  border-color: #ffd700;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}
.form-input:focus {
  border-color: #5c2a72;
  box-shadow: 0 0 0 1px rgba(92, 42, 114, 0.3);
}
.form-radio {
  appearance: none;
  border-radius: 50%;
  border-width: 1px;
  height: 1em;
  width: 1em;
}
.form-radio:checked {
  background-color: currentColor;
}
</style>
