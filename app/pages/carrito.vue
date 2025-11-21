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

// Definición de interfaces
interface Direccion { region: string; comuna: string; direccion: string; }
interface CartItem {
	id: number;
	nombre: string;
	precio: number;
	tipo: 'Producto' | 'Servicio' | 'Urna' | 'Accesorio';
	quantity: number;
	selected: boolean;
	petName?: string;
	petWeight?: number;
	petAge?: number;
	direccion?: Direccion;
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

const cartTotal = computed(() => 
	cart.value.reduce((sum, item) => sum + (item.selected ? item.precio * item.quantity : 0), 0)
);


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

const handlePayment = async () => {
	const selectedItems = cart.value.filter(item => item.selected);
	if (selectedItems.length === 0) {
		alert('Selecciona al menos un artículo para proceder al pago.');
		return;
	}

	isProcessing.value = true;
	let idPedido: number | null = null;
	
	try {
		// *** IMPORTANTE ***: Reemplaza 1 con el ID del usuario autenticado
		const idUsuario = 1; 

		// PASO 1: Crear el Pedido (Llama a /api/pedidos.post.ts)
		const pedidoResponse: PedidoResponse = await $fetch('/api/pedidos', {
			method: 'POST',
			body: { 
				id_usuario: idUsuario, 
				cart: selectedItems,
			},
		});

		if (pedidoResponse.statusCode !== 201 || typeof pedidoResponse.id_pedido !== 'number') {
			 throw new Error(pedidoResponse.message || 'Fallo al crear el pedido.');
		}

		idPedido = pedidoResponse.id_pedido;
		
		// PASO 2: Proceder al Checkout/Pago (Llama a /api/checkout.post.ts)
		const pagoExitosoSimulado = true; 

		const checkoutResponse: CheckoutResponse = await $fetch('/api/checkout', {
			method: 'POST',
			body: { 
				idPedido: idPedido,
				pagoExitoso: pagoExitosoSimulado 
			},
		});

		const code = checkoutResponse.codTrazabilidad;
		
		// PASO 3: Redirección al tracking
		if (code) {
			rawCart.cart.value = rawCart.cart.value.filter(item => 
				!selectedItems.some(selectedItem => selectedItem.id === item.id)
			);
			
			alert(`¡Compra finalizada! Código de seguimiento: ${code}. Redirigiendo...`);
			await navigateTo(`/tracking?codigo=${code}`, { replace: true });
			
		} else {
			alert('Error: No se recibió código de seguimiento.');
		}

	} catch (error: any) {
		console.error('Error durante el proceso de pago:', error);
		alert(error.data?.statusMessage || error.message || 'Error desconocido al procesar el pago. Intente de nuevo.');
	} finally {
		isProcessing.value = false;
	}
};
</script>

<style scoped lang="postcss">
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-deep { background-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.text-red-500 { color: #ef4444; }
.hover\:text-red-700:hover { color: #b91c1c; }
.hover\:text-red-600:hover { color: #dc2626; }
</style>