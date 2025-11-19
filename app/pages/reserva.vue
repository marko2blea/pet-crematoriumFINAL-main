<template>
  <div class="pt-14 py-20 min-h-screen container mx-auto px-4">

    <div class="max-w-4xl mx-auto">

      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-purple-dark mb-3">Finalizar Pedido</h1>
        <p class="text-lg text-gray-600">
          Complete los datos requeridos para su {{ isServiceOrder ? 'Reserva de Servicio' : 'Entrega de Productos' }}.
        </p>
      </div>

      <div v-if="isLoading" class="mb-4 p-4 rounded-lg text-center text-lg bg-blue-100 border border-blue-400 text-blue-700">
        Procesando su pedido...
      </div>
      <div v-if="errorMessage" class="mb-4 p-4 rounded-lg text-center text-sm bg-red-100 border border-red-400 text-red-700">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="confirmarPago" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-8">

          <!-- Datos Mascota (solo si es servicio) -->
          <div v-if="isServiceOrder" class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark">
            <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">1. Datos de la Mascota</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Nombre de la Mascota</label>
                <input v-model="formMascota.petName" type="text" required class="form-input"/>
              </div>
              <div>
                <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Peso (kg)</label>
                <input v-model.number="formMascota.petWeight" type="number" step="0.1" min="0" required class="form-input"/>
              </div>
              <div>
                <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Edad (años)</label>
                <input v-model.number="formMascota.petAge" type="number" min="0" class="form-input"/>
              </div>
            </div>
          </div>

          <!-- Dirección / Retiro -->
          <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-purple-dark">
            <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">
              {{ isServiceOrder ? '2. Dirección de Retiro del Servicio' : '1. Opciones de Entrega' }}
            </h2>

            <div class="space-y-4">
              <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Método de Entrega</label>
              <select v-model="formEntrega.deliveryType" required class="form-input bg-white">
                <option value="delivery">{{ isServiceOrder ? 'Retiro de Mascota a Domicilio' : 'Envío a Domicilio' }}</option>
                <option value="pickup">Retiro/Entrega en Oficina (Tomé)</option>
              </select>

              <div v-if="formEntrega.deliveryType === 'delivery'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Región</label>
                    <input v-model="formDireccion.region" type="text" required class="form-input"/>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Comuna</label>
                    <input v-model="formDireccion.comuna" type="text" required class="form-input"/>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-dark-primary-blue mb-2">Dirección Completa</label>
                  <input v-model="formDireccion.direccion" type="text" required class="form-input"/>
                </div>
              </div>

              <div v-else class="bg-blue-50 p-4 rounded-lg text-blue-800">
                <p class="font-semibold">Retiro/Entrega en Oficina Seleccionada:</p>
                <p class="text-sm">Podrá retirar o entregar su pedido en nuestra oficina de Tomé. Le notificaremos cuando esté listo.</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Resumen -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-bd-gold-accent sticky top-24">
            <h2 class="text-2xl font-bold text-purple-dark mb-4 border-b pb-2">Resumen</h2>

            <ul class="space-y-2 mb-4 max-h-48 overflow-y-auto">
              <li v-for="item in cart" :key="item.id" class="flex justify-between items-center text-sm">
                <span class="text-gray-700">{{ item.nombre }} x{{ item.quantity }}</span>
                <span class="font-semibold text-dark-primary-blue">${{ (item.precio * item.quantity).toLocaleString('es-CL') }}</span>
              </li>
            </ul>

            <div class="space-y-3 text-lg border-t pt-4">
              <div class="flex justify-between"><span class="text-gray-600">Subtotal:</span><span class="font-semibold text-dark-primary-blue">${{ cartTotal.toLocaleString('es-CL') }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">IVA (19%):</span><span class="font-semibold text-dark-primary-blue">${{ iva.toLocaleString('es-CL') }}</span></div>
              <hr class="border-gray-300">
              <div class="flex justify-between text-2xl font-bold text-purple-dark"><span>Total:</span><span>${{ totalGeneral.toLocaleString('es-CL') }}</span></div>
            </div>

            <div class="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <p class="text-sm text-purple-dark font-semibold">El pago se gestiona vía Transferencia Bancaria.</p>
              <p class="text-xs text-gray-600 mt-1">Al confirmar, su pedido quedará automáticamente marcado como "Pagado".</p>
            </div>

            <button type="submit" :disabled="isLoading || cart.length === 0" class="w-full mt-6 py-3 rounded-xl font-bold text-lg bg-purple-deep text-white hover:bg-purple-light transition shadow-lg">
              Confirmar Pedido
            </button>
          </div>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '../composables/useAuth';
import { useCart } from '../composables/useCart';

const router = useRouter();
const user = useUser();
const { cart, cartTotal, loadCart, clearCart } = useCart();

const isServiceOrder = computed(() => cart.value.some(item => item.tipo === 'Servicio'));
const isLoading = ref(false);
const errorMessage = ref('');

// Formularios reactivos
const formMascota = ref({ petName: '', petWeight: null, petAge: null });
const formDireccion = ref({ region: '', comuna: '', direccion: '' });
const formEntrega = ref({ deliveryType: 'delivery' });

// Totales
const iva = computed(() => Math.round(cartTotal.value * 0.19));
const totalGeneral = computed(() => cartTotal.value + iva.value);

// Cargar carrito
onMounted(() => {
  loadCart();
  if (user.value) {
    formDireccion.value = { 
      region: user.value.region || '', 
      comuna: user.value.comuna || '', 
      direccion: user.value.direccion || '' 
    };
  }
});

// --- Confirmar Pago (llama a /api/pedidos) ---
const confirmarPago = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const bodyPayload = {
      id_usuario: user.value?.id_usuario,
      cart: cart.value.map(item => ({
        ...item,
        direccion: formEntrega.value.deliveryType === 'delivery' ? formDireccion.value : undefined
      }))
    };

    const response = await $fetch('/api/pedidos', {
      method: 'POST',
      body: bodyPayload
    });

    clearCart();
    alert(`Pago confirmado! Código de trazabilidad: ${response.cod_trazabilidad || 'N/A'}`);
    router.push('/');

  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.data?.statusMessage || 'Error al confirmar el pago';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.form-input { 
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid #d1d5db; 
  border-radius: 0.5rem; 
  outline: none; 
}
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.border-bd-gold-accent { border-color: #FFD700; }
</style>
