// app/composables/useCart.ts
import { ref, computed, onMounted } from 'vue';
import type { Product, CartItem } from '../../app/types'; // Importa los tipos

const CART_STORAGE_KEY = 'miApp_carrito';

// Tipar el ref con CartItem[]
const cart = ref<CartItem[]>([]);

const loadCart = () => {
  if (process.client) {
    const storedCart = sessionStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      cart.value = JSON.parse(storedCart);
    }
  }
};

const saveCart = () => {
  if (process.client) {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.value));
  }
};

export const useCart = () => {
  
  onMounted(loadCart); // Asegúrate de cargar el carrito al montar

  const cartCount = computed(() => cart.value.reduce((total, item) => total + item.quantity, 0));
  const cartTotal = computed(() => cart.value.reduce((total, item) => total + (item.precio * item.quantity), 0));

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.value.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.value.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        tipo: product.tipo,
        quantity: quantity
      });
    }
    saveCart();
  };

  const removeFromCart = (productId: number) => {
    cart.value = cart.value.filter(item => item.id !== productId);
    saveCart();
  };

  const clearCart = () => {
    cart.value = [];
    saveCart();
  };

  // (CORRECCIÓN) Función que faltaba
  const increaseQuantity = (productId: number) => {
    const item = cart.value.find(item => item.id === productId);
    if (item) {
      item.quantity++;
      saveCart();
    }
  };

  // (CORRECCIÓN) Función que faltaba
  const decreaseQuantity = (productId: number) => {
    const item = cart.value.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      saveCart();
    } else if (item && item.quantity === 1) {
      // Si la cantidad es 1 y se reduce, se elimina del carrito
      removeFromCart(productId);
    }
  };

  return {
    cart,
    loadCart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity, // (CORRECCIÓN) Exportar la función
    decreaseQuantity, // (CORRECCIÓN) Exportar la función
    cartCount,
    cartTotal
  };
};