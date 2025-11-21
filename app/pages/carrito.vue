<template>
	<div class="pt-14 py-20 min-h-screen container mx-auto px-4">
		<div class="max-w-3xl mx-auto">
			<h1 class="text-4xl font-extrabold text-purple-dark mb-8 text-center">
				<font-awesome-icon icon="fas fa-shopping-cart" class="mr-3 text-purple-deep" />
				Mi Carrito
			</h1>

			<div v-if="cart.length === 0" class="text-center bg-white p-10 rounded-xl shadow-lg">
				<p class="text-2xl text-gray-600 mb-6">Tu carrito está vacío.</p>
				<NuxtLink to="/" 
						class="bg-purple-deep text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-purple-light transition duration-300 transform hover:scale-105 shadow-md">
					Ver Servicios y Productos
				</NuxtLink>
			</div>

			<div v-else class="bg-white rounded-xl shadow-2xl overflow-hidden">
				<ul class="divide-y divide-gray-200">
					<li v-for="item in cart" :key="item.id" class="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between">
						<div class="flex items-center mb-4 sm:mb-0">
							<input type="checkbox" v-model="item.selected" 
									@change="onToggleItem(item)"
									class="mr-3 w-5 h-5 text-purple-deep rounded border-gray-300 focus:ring-2 focus:ring-purple-deep" />
							
							<div class="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<font-awesome-icon :icon="getIconForProduct(item.tipo)" class="text-2xl text-gray-400" />
							</div>
							
							<div class="ml-4">
								<h3 class="text-lg font-bold text-purple-dark">{{ item.nombre }}</h3>
								<p class="text-sm text-gray-500">{{ item.tipo }}</p>
								<p class="text-md font-semibold text-dark-primary-blue mt-1">${{ item.precio.toLocaleString('es-CL') }} c/u</p>
							</div>
						</div>

						<div class="flex items-center space-x-4">
							<div class="flex items-center border border-gray-300 rounded-lg">
								<button @click="decreaseQuantity(item.id)" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">
									<font-awesome-icon icon="fas fa-minus" class="text-sm" />
								</button>
								<span class="px-4 py-2 font-bold text-dark-primary-blue">{{ item.quantity }}</span>
								<button @click="increaseQuantity(item.id)" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">
									<font-awesome-icon icon="fas fa-plus" class="text-sm" />
								</button>
							</div>

							<button @click="removeFromCart(item.id)" 
									class="text-red-500 hover:text-red-700 p-2"
									title="Eliminar producto">
								<font-awesome-icon icon="fas fa-trash" class="text-lg" />
							</button>
						</div>
					</li>
				</ul>

				<div class="p-6 bg-gray-50 border-t border-gray-200">
					<div class="flex justify-between items-center mb-4">
						<span class="text-xl font-bold text-dark-primary-blue">Subtotal:</span>
						<span class="text-3xl font-extrabold text-purple-dark">${{ cartTotal.toLocaleString('es-CL') }}</span>
					</div>
					<div v-if="servicioLogistica.costo_retiro > 0" class="flex justify-between items-center text-sm mb-2 text-red-600">
                        <span>Costo Adicional por Retiro a Domicilio:</span>
                        <span>+ ${{ servicioLogistica.costo_retiro.toLocaleString('es-CL') }}</span>
                    </div>
                    <div class="flex justify-between items-center text-xl font-extrabold border-t border-gray-300 pt-2">
                        <span>TOTAL A PAGAR:</span>
                        <span class="text-3xl text-purple-deep">${{ carritoTotalConRetiro.toLocaleString('es-CL') }}</span>
                    </div>

					<p class="text-sm text-gray-500 text-right mb-4">El IVA (19%) se calculará en el siguiente paso.</p>
					
					<button @click="handlePayment"
							:disabled="!cart.filter(item => item.selected).length || isProcessing"
							class="block w-full text-center bg-purple-deep text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-purple-light transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
						{{ isProcessing ? 'Procesando Pago...' : 'Proceder al Pago' }}
					</button>

					<button @click="clearCart" class="w-full text-center text-gray-600 hover:text-red-600 font-medium py-2 mt-3 transition duration-150">
						Vaciar Carrito
					</button>
				</div>
			</div>
		</div>

		<div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
			<div class="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
				<h2 class="text-2xl font-bold text-purple-deep mb-6 border-b pb-2">
					Detalles Adicionales del Pedido
				</h2>

				<form @submit.prevent="confirmPayment" class="space-y-6">
					
					<div v-if="hasService" class="border p-4 rounded-lg bg-yellow-50">
						<h3 class="font-bold text-lg text-yellow-800 mb-3">Datos de la Mascota (Servicio)</h3>
						
						<div class="space-y-3">
							<div>
								<label for="petName" class="block text-sm font-medium text-gray-700">Nombre de la Mascota</label>
								<input type="text" id="petName" v-model="mascotaForm.petName" required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
							<div>
								<label for="petWeight" class="block text-sm font-medium text-gray-700">Peso (kg)</label>
								<input type="number" id="petWeight" v-model.number="mascotaForm.petWeight" required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
							<div>
								<label for="petAge" class="block text-sm font-medium text-gray-700">Edad (años)</label>
								<input type="number" id="petAge" v-model.number="mascotaForm.petAge"
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
						</div>
					</div>

					<div class="border p-4 rounded-lg" :class="hasService ? 'bg-blue-50' : 'bg-green-50'">
						<h3 class="font-bold text-lg mb-3" :class="hasService ? 'text-blue-800' : 'text-green-800'">
                            Logística de Entrega ({{ hasService ? 'Retiro Mascota' : 'Entrega Producto' }})
                        </h3>

						<div class="space-y-2">
                            <label class="inline-flex items-center">
								<input type="radio" name="tipoEntrega" value="LOCAL" v-model="servicioLogistica.tipo_entrega" required
									class="form-radio text-purple-deep" />
								<span class="ml-2">Retiro/Entrega en **Tienda**</span>
							</label>
							<label class="inline-flex items-center ml-6">
								<input type="radio" name="tipoEntrega" value="DOMICILIO" v-model="servicioLogistica.tipo_entrega" required
									class="form-radio text-purple-deep" />
								<span class="ml-2">
                                    {{ hasService ? 'Retiro de Mascota a Domicilio' : 'Envío a Domicilio' }} 
                                    <span v-if="servicioLogistica.tipo_entrega === 'DOMICILIO'" class="text-red-600 font-semibold"> 
                                        (+ ${{ COSTO_RETIRO_DOMICILIO.toLocaleString('es-CL') }})
                                    </span>
                                </span>
							</label>
						</div>

						<div v-if="servicioLogistica.tipo_entrega === 'DOMICILIO'" class="mt-4 space-y-3">
							<div>
								<label for="region" class="block text-sm font-medium text-gray-700">Región</label>
								<input type="text" id="region" v-model="servicioLogistica.region" required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
							<div>
								<label for="comuna" class="block text-sm font-medium text-gray-700">Comuna</label>
								<input type="text" id="comuna" v-model="servicioLogistica.comuna" required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
							<div>
								<label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
								<input type="text" id="direccion" v-model="servicioLogistica.direccion" required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
							</div>
						</div>
					</div>
                    
                    <div class="border p-4 rounded-lg bg-purple-50">
						<h3 class="font-bold text-lg text-purple-800 mb-3">Método de Pago</h3>

						<div class="space-y-2">
							<label class="block items-center">
								<input type="radio" name="metodoPago" value="TRANSFERENCIA" v-model="pagoForm.metodoPago" required
									class="form-radio text-purple-deep" />
								<span class="ml-2 font-medium">Transferencia Bancaria</span>
							</label>
							<label class="block items-center">
								<input type="radio" name="metodoPago" value="EFECTIVO" v-model="pagoForm.metodoPago" required
									class="form-radio text-purple-deep" />
								<span class="ml-2 font-medium">Efectivo al Retirar / Contra Entrega</span>
							</label>
						</div>
					</div>

					<div class="flex justify-end space-x-3 pt-4">
						<button type="button" @click="showDetailsModal = false" class="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
							Volver
						</button>
						<button type="submit" :disabled="isProcessing"
								class="py-2 px-4 rounded-lg text-white font-bold bg-purple-deep hover:bg-purple-light disabled:opacity-50">
							{{ isProcessing ? 'Confirmando...' : 'Confirmar y Pagar' }}
						</button>
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
import { faShoppingCart, faTrash, faPlus, faMinus, faHeart, faBoxOpen, faPuzzlePiece, faPaw } from '@fortawesome/free-solid-svg-icons';

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

// --- ESTADO PARA EL FORMULARIO MODAL ---
const showDetailsModal = ref(false);
const mascotaForm = ref({ petName: '', petWeight: 0, petAge: 0 });
const pagoForm = ref({ metodoPago: 'TRANSFERENCIA' }); 

// Lógica de Retiro y Entrega (Dominante: Retiro de Mascota si hay Servicio)
const servicioLogistica = ref({
    tipo_entrega: 'LOCAL' as 'DOMICILIO' | 'RETIRO',
    region: '',
    comuna: '',
    direccion: '',
    costo_retiro: 0,
});


// Propiedades computadas
const selectedItems = computed(() => cart.value.filter(item => item.selected));
const hasService = computed(() => selectedItems.value.some(item => item.tipo === 'Servicio'));
const hasProduct = computed(() => selectedItems.value.some(item => item.tipo !== 'Servicio'));

// Total sin costo adicional
const cartTotal = computed(() => 
	selectedItems.value.reduce((sum, item) => sum + (item.precio * item.quantity), 0)
);

// Total con costo adicional de retiro a domicilio (se actualiza reactivamente)
const carritoTotalConRetiro = computed(() => {
    let total = cartTotal.value;
    let costo = 0;
    
    // Si la entrega es a domicilio, aplica el costo, independientemente de si es servicio o producto
    if (servicioLogistica.value.tipo_entrega === 'DOMICILIO') {
        costo = COSTO_RETIRO_DOMICILIO;
    }
    
    // Sincronizar el costo con el objeto reactivo y devolver el total
    servicioLogistica.value.costo_retiro = costo;
    return total + costo;
});


watchEffect(() => {
	const newCart = rawCart.cart.value.map(item => {
		const existingItem = cart.value.find(i => i.id === item.id);
		return {
			...item,
			selected: existingItem ? existingItem.selected : true
		};
	}) as CartItem[];
	cart.value = newCart;
});


function getIconForProduct(tipo: string) {
	if (tipo === 'Servicio') return faHeart;
	if (tipo === 'Urna') return faBoxOpen;
	if (tipo === 'Accesorio') return faPuzzlePiece;
	return faPaw;
}

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

function onToggleItem(toggledItem: CartItem) {
	if (toggledItem.tipo === 'Servicio' && toggledItem.selected) {
		cart.value.forEach(item => {
			if (item.id !== toggledItem.id && item.tipo === 'Servicio') {
				item.selected = false;
			}
		});
	}
	rawCart.cart.value = rawCart.cart.value.map(item => {
		const localItem = cart.value.find(i => i.id === item.id);
		return { ...item, selected: localItem ? localItem.selected : false };
	});
}

// FUNCIÓN PRINCIPAL: Abre el modal
const handlePayment = () => {
	if (selectedItems.value.length === 0) {
		alert('Selecciona al menos un artículo para proceder al pago.');
		return;
	}
	showDetailsModal.value = true;
};


// FUNCIÓN DE CONFIRMACIÓN: Llama a la API
const confirmPayment = async () => {
	// 1. Validar campos
	if (hasService.value && (!mascotaForm.value.petName || !mascotaForm.value.petWeight)) {
		alert('Por favor, completa los datos de la mascota.');
		return;
	}
	if (servicioLogistica.value.tipo_entrega === 'DOMICILIO' && (!servicioLogistica.value.region || !servicioLogistica.value.direccion)) {
		alert('Por favor, completa la dirección para el retiro/envío a domicilio.');
		return;
	}

	isProcessing.value = true;
	showDetailsModal.value = false;

	try {
		// 2. Preparar el carrito final con los datos del formulario
		const finalCart = selectedItems.value.map(item => {
			let newItem: CartItem = { ...item };

			// Adjuntar datos de Mascota al Servicio (y al primer item si hay servicio)
			if (item.tipo === 'Servicio') {
				newItem = { ...newItem, ...mascotaForm.value };
			}
			
			// Adjuntar Logística y Costo al ítem (se adjunta a todos, pero el BE lo usa del primero)
			newItem.direccion = servicioLogistica.value;
			newItem.costo_adicional = servicioLogistica.value.costo_retiro;
			
			return newItem;
		});

		// 3. Obtener ID de Usuario (REEMPLAZAR)
		const idUsuario = 1; 

		// 4. PASO 1: Crear el Pedido (llama a /api/pedidos.post.ts)
		const pedidoResponse: PedidoResponse = await $fetch('/api/pedidos', {
			method: 'POST',
			body: { 
				id_usuario: idUsuario, 
				cart: finalCart, 
                metodo_pago: pagoForm.value.metodoPago,
			},
		});

		if (pedidoResponse.statusCode !== 201 || typeof pedidoResponse.id_pedido !== 'number') {
			 throw new Error(pedidoResponse.message || 'Fallo al crear el pedido.');
		}

		const idPedido = pedidoResponse.id_pedido;
		
		// 5. PASO 2: Proceder al Checkout/Pago 
		const pagoExitosoSimulado = true; 

		const checkoutResponse: CheckoutResponse = await $fetch('/api/checkout', {
			method: 'POST',
			body: { 
				idPedido: idPedido,
				pagoExitoso: pagoExitosoSimulado 
			},
		});

		const code = checkoutResponse.codTrazabilidad;
		
		// 6. Redirección al tracking
		if (code) {
			// Limpiar solo los ítems pagados
			rawCart.cart.value = rawCart.cart.value.filter(item => 
				!selectedItems.value.some(selectedItem => selectedItem.id === item.id)
			);
			
			alert(`¡Compra finalizada! Código de seguimiento: ${code}. Redirigiendo...`);
			await navigateTo(`/tracking?codigo=${code}`, { replace: true });
			
		} else {
			alert('Error: No se recibió código de seguimiento.');
		}

	} catch (error: any) {
		console.error('Error durante el proceso de pago:', error);
		alert(error.data?.statusMessage || error.message || 'Error desconocido al procesar el pago. Intente de nuevo.');
		showDetailsModal.value = true;
	} finally {
		isProcessing.value = false;
	}
};
</script>

<style scoped>
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.hover\:bg-purple-light:hover { background-color: #6C3483; }
.text-dark-primary-blue { color: #34495e; }
/* Asegura que el form-radio esté disponible si no usas un plugin */
.form-radio { appearance: none; border-radius: 50%; border-width: 1px; height: 1em; width: 1em; }
.form-radio:checked { background-color: currentColor; }
</style>