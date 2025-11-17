<template>
  <div class="min-h-screen flex flex-col font-sans main-background">
    
    <header class="bg-bd-purple-dark shadow-lg py-2 fixed top-0 left-0 right-0 z-50">
      <div class="container mx-auto px-4 flex items-center justify-between text-white h-14">
        
        <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center p-2 bg-white rounded-lg shadow-md">
                <img src="/logo2.png" alt="Crematorio San Antonio Logo" class="h-10">
            </NuxtLink>
        </div>

        <div class="hidden lg:flex flex-grow items-center space-x-2 justify-center px-4"> 
          
          <NuxtLink to="/" :class="isActive('/')" class="text-white py-2 px-3 rounded-lg font-medium hover:bg-bd-purple-dark-hover transition duration-150 flex-shrink-0 text-center whitespace-nowrap w-40 flex items-center space-x-2 justify-center">
            <font-awesome-icon icon="fas fa-home" /><span>Inicio</span>
          </NuxtLink>
          <NuxtLink to="/about" :class="isActive('/about')" class="text-white py-2 px-3 rounded-lg font-medium hover:bg-bd-purple-dark-hover transition duration-150 flex-shrink-0 text-center whitespace-nowrap w-40 flex items-center space-x-2 justify-center">
            <font-awesome-icon icon="fas fa-info-circle" /><span>Nosotros</span>
          </NuxtLink>
          <NuxtLink to="/instalaciones" :class="isActive('/instalaciones')" class="text-white py-2 px-3 rounded-lg font-medium hover:bg-bd-purple-dark-hover transition duration-150 flex-shrink-0 text-center whitespace-nowrap w-40 flex items-center space-x-2 justify-center">
            <font-awesome-icon icon="fas fa-building" /><span>Instalaciones</span>
          </NuxtLink>
          <NuxtLink to="/memorial" :class="isActive('/memorial')" class="text-white py-2 px-3 rounded-lg font-medium hover:bg-bd-purple-dark-hover transition duration-150 flex-shrink-0 text-center whitespace-nowrap w-40 flex items-center space-x-2 justify-center">
            <font-awesome-icon icon="fas fa-cross" /><span>Memorial</span>
          </NuxtLink>
          <NuxtLink to="/tracking" :class="isActive('/tracking')" class="text-white py-2 px-3 rounded-lg font-medium hover:bg-bd-purple-dark-hover transition duration-150 flex-shrink-0 text-center whitespace-nowrap w-40 flex items-center space-x-2 justify-center">
            <font-awesome-icon icon="fas fa-route" /><span>Seguimiento</span>
          </NuxtLink>
          
          <template v-if="user && user.id_rol !== 1">
            <NuxtLink to="/admin/dashboard" :class="isActive('/admin/dashboard', true)" class="bg-white text-bd-purple-dark py-2 px-3 rounded-lg font-bold hover:bg-gray-100 transition duration-150 border-2 border-white flex-shrink-0 text-center whitespace-nowrap shadow-md w-40 flex items-center space-x-2 justify-center">
              <font-awesome-icon icon="fas fa-chart-line" /><span>Dashboard</span>
            </NuxtLink>
          </template>
        </div>

        <nav class="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          
          <NuxtLink to="/carrito" title="Carrito de Compras" class="text-white hover:text-gray-200 transition duration-150 relative p-2">
              <font-awesome-icon icon="fas fa-shopping-cart" class="text-xl" />
              <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-bd-purple-dark">
                {{ cartCount }}
              </span>
          </NuxtLink>
          
          <NuxtLink v-if="!user" to="/login" class="hidden lg:flex bg-white text-bd-purple-dark py-2 px-4 rounded-lg font-bold hover:bg-gray-100 transition duration-150 flex-shrink-0 shadow-md">
            Iniciar sesión 
          </NuxtLink>

          <div v-else class="relative hidden lg:block">
            <button @click="toggleMenu" class="flex items-center space-x-2 text-white hover:text-gray-200 transition duration-150 p-2 rounded-lg hover:bg-bd-purple-dark-hover" title="Opciones de Usuario">
                <font-awesome-icon icon="fas fa-user" class="text-xl" />
                <div class="flex flex-col items-start">
                  <span class="text-sm font-bold leading-none">Hola, {{ user.nombre || 'Usuario' }}</span>
                  <span class="text-xs text-green-400 font-semibold leading-none flex items-center">
                    <span class="h-2 w-2 bg-green-400 rounded-full mr-1.5"></span>
                    Conectado
                  </span>
                </div>
            </button>
            
            <div v-if="isMenuOpen" 
                 class="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
              <div class="p-4 border-b border-gray-200 bg-gray-50">
                <p class="font-bold text-purple-dark truncate">{{ user.nombre }} {{ user.apellido_paterno }}</p>
                <p class="text-xs text-gray-600 truncate">{{ user.correo }}</p>
              </div>
              <NuxtLink to="/editar-cuenta" @click="closeMenu" class="block px-4 py-2 hover:bg-gray-100 transition duration-100 text-sm">
                <font-awesome-icon icon="fas fa-user-edit" class="mr-2 text-bd-gold-accent" />Editar Mi Cuenta
              </NuxtLink>
              <NuxtLink v-if="user.id_rol !== 1" to="/admin/gestionar-usuario" @click="closeMenu" class="block px-4 py-2 hover:bg-gray-100 transition duration-100 text-sm">
                <font-awesome-icon icon="fas fa-users-cog" class="mr-2 text-bd-purple-dark" />Gestionar Usuarios
              </NuxtLink>
              <button @click="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-100 text-sm text-red-600 border-t border-gray-200">
                <font-awesome-icon icon="fas fa-sign-out-alt" class="mr-2" />Cerrar Sesión
              </button>
            </div>
          </div>

          <button @click="toggleMobileMenu" class="lg:hidden text-white p-2 text-xl">
              <font-awesome-icon :icon="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'" />
          </button>
          
        </nav>
      </div>
    </header>

    <div 
      v-if="isMobileMenuOpen" 
      @click="closeMobileMenu" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[90]"
    ></div>
    <div 
      :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
      class="lg:hidden fixed top-0 right-0 w-72 h-full bg-white shadow-xl z-[91] transition-transform duration-300 ease-in-out"
    >
        <div class="flex flex-col h-full">
            <div class="p-4 border-b border-gray-200">
                <div v-if="user" class="text-left">
                    <p class="font-bold text-purple-dark truncate">{{ user.nombre }} {{ user.apellido_paterno }}</p>
                    <p class="text-xs text-gray-600 truncate">{{ user.correo }}</p>
                </div>
                <p v-else class="font-bold text-purple-dark">Menú Principal</p>
            </div>

            <nav class="flex-grow p-4 space-y-2 text-lg text-dark-primary-blue font-semibold overflow-y-auto">
                <NuxtLink to="/" @click="closeMobileMenu" 
                          class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                    <font-awesome-icon icon="fas fa-home" class="mr-3 w-6" />Inicio
                </NuxtLink>
                <NuxtLink to="/about" @click="closeMobileMenu" 
                          class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                    <font-awesome-icon icon="fas fa-info-circle" class="mr-3 w-6" />Nosotros
                </NuxtLink>
                <NuxtLink to="/instalaciones" @click="closeMobileMenu" 
                          class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                    <font-awesome-icon icon="fas fa-building" class="mr-3 w-6" />Instalaciones
                </NuxtLink>
                <NuxtLink to="/memorial" @click="closeMobileMenu" 
                          class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                    <font-awesome-icon icon="fas fa-cross" class="mr-3 w-6" />Memorial
                </NuxtLink>
                <NuxtLink to="/tracking" @click="closeMobileMenu" 
                          class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                    <font-awesome-icon icon="fas fa-route" class="mr-3 w-6" />Seguimiento
                </NuxtLink>

                <template v-if="user && user.id_rol !== 1">
                    <hr class="my-3 border-gray-300" />
                    <NuxtLink to="/admin/dashboard" @click="closeMobileMenu" 
                              class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 text-purple-deep [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                        <font-awesome-icon icon="fas fa-chart-line" class="mr-3 w-6" />Dashboard
                    </NuxtLink>
                    <NuxtLink to="/admin/gestionar-usuario" @click="closeMobileMenu" 
                              class="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-150 text-purple-deep [&.router-link-active]:bg-purple-deep [&.router-link-active]:text-white">
                        <font-awesome-icon icon="fas fa-users-cog" class="mr-3 w-6" />Gestionar Usuarios
                    </NuxtLink>
                </template>
            </nav>

            <div class="p-4 border-t border-gray-200">
                <NuxtLink v-if="!user" to="/login" @click="closeMobileMenu" class="w-full text-center bg-purple-deep text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-light transition">
                    Iniciar sesión 
                </NuxtLink>
                <template v-else>
                    <NuxtLink to="/editar-cuenta" @click="closeMobileMenu" class="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-100 text-sm font-semibold text-dark-primary-blue">
                        <font-awesome-icon icon="fas fa-user-edit" class="mr-2 text-bd-gold-accent" />Editar Mi Cuenta
                    </NuxtLink>
                    <button @click="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-100 text-sm font-semibold text-red-600">
                        <font-awesome-icon icon="fas fa-sign-out-alt" class="mr-2" />Cerrar Sesión
                    </button>
                </template>
            </div>
        </div>
    </div>

    <main class="flex-grow pt-20"> 
        <slot /> 
    </main>
    
    <footer class="bg-purple-deep text-white p-10 mt-auto shadow-2xl border-t-4 border-bd-gold-accent">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0 md:space-x-8">
        
        <div class="md:w-1/4 space-y-3">
          <p class="text-xl font-bold mb-3 text-bd-gold-accent">Contacto & Trazabilidad</p>
          <div class="text-sm space-y-3">
            <p class="flex items-center">
              <font-awesome-icon icon="fas fa-phone-alt" class="mr-3 text-bd-gold-accent w-4" /> 
              Teléfono: <a href="tel:+5693428591" class="ml-2 hover:underline">+56 (9) 3428591</a>
            </p>
            <p class="flex items-center">
              <font-awesome-icon icon="fas fa-envelope" class="mr-3 text-bd-gold-accent w-4" /> 
              Email: <a href="mailto:contacto@crematoriosanantonio.cl" class="ml-2 hover:underline">contacto@crematoriosanantonio.cl</a>
            </p>
          </div>
          <NuxtLink to="/tracking" class="mt-4 inline-block bg-bd-purple-light text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-bd-purple-dark-hover transition shadow-md">
            Rastrear Servicio ➡️
          </NuxtLink>
        </div>
        
        <div class="md:w-1/4 space-y-4">
            <p class="text-xl font-bold mb-3 text-bd-gold-accent">Métodos de Pago</p>
            <div class="flex flex-wrap gap-3 text-4xl text-gray-300">
                <font-awesome-icon icon="fab fa-cc-visa" title="Visa" class="hover:text-white transition" />
                <font-awesome-icon icon="fab fa-cc-mastercard" title="Mastercard" class="hover:text-white transition" />
                <font-awesome-icon icon="fas fa-money-check-alt" title="Transferencia" class="hover:text-white transition" />
            </div>
            <p class="text-sm text-white pt-2">Aceptamos transferencias y tarjetas de crédito principales.</p>
        </div>

        <div class="md:w-1/4 space-y-4 text-center md:text-left">
            <p class="text-xl font-bold mb-3 text-bd-gold-accent">Comunidad</p>
            <div class="flex justify-center md:justify-start space-x-6 text-4xl">
                <a href="#" class="text-gray-300 hover:text-bd-gold-accent transition duration-200" title="Síguenos en Facebook">
                    <font-awesome-icon icon="fab fa-facebook-f" />
                </a> 
                <a href="#" class="text-gray-300 hover:text-bd-gold-accent transition duration-200" title="Síguenos en Instagram">
                    <font-awesome-icon icon="fab fa-instagram" />
                </a> 
            </div>
        </div>
        
        <div class="md:w-1/4 space-y-3 text-right">
            <p class="text-xs font-semibold text-white">Horario de Oficina:</p>
            <p class="text-sm font-medium">Lun - Sáb: 09:00 a 18:00 hrs.</p>
            <p class="text-sm text-red-400 font-bold">Emergencias 24/7</p>
            <hr class="border-gray-700 mt-4">
            <p class="text-xs text-white mt-2">&copy; 2025 Crematorio San Antonio. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>

    <section class="fixed bottom-0 left-0 right-0 z-40 bg-bd-purple-dark text-white text-center py-1.5 shadow-2xl">
      <p class="text-sm font-medium">Horario: Lunes a Sábado | 09:00 a 18:00 hrs. • Dirección: Tomé, Región del Biobío (Emergencias 24/7)</p>
    </section>
    
    <a href="#" 
      title="Contacto Rápido"
      class="fixed bottom-16 right-6 z-50 bg-whatsapp text-white p-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
        <font-awesome-icon icon="fab fa-whatsapp" class="text-3xl" />
    </a>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faShoppingCart, faUser, faUserEdit, faSignOutAlt, faPhoneAlt, faEnvelope, faBars, 
  faHome, faInfoCircle, faBuilding, faCross, faRoute, faChartLine, faBook, faFileAlt, 
  faMoneyCheckAlt, faUsersCog, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faCcVisa, faCcMastercard, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons'; 

library.add(
  faShoppingCart, faUser, faUserEdit, faSignOutAlt, faPhoneAlt, faEnvelope, faBars, 
  faWhatsapp, faCcVisa, faCcMastercard, faFacebookF, faInstagram, faHome, faInfoCircle, 
  faBuilding, faCross, faRoute, faChartLine, faBook, faFileAlt, faMoneyCheckAlt, 
  faUsersCog, faTimes
);

const user = useUser();
const { cartCount, loadCart } = useCart();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  loadCart();
});

const isMenuOpen = ref(false); 
const isMobileMenuOpen = ref(false);

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; }; 
const closeMenu = () => { isMenuOpen.value = false; }; 

const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value; };
const closeMobileMenu = () => { isMobileMenuOpen.value = false; };

const logout = () => { 
    user.value = null; 
    isMenuOpen.value = false; 
    isMobileMenuOpen.value = false;
    router.push('/'); 
};

// (Lógica de clase activa sin cambios)
const isActive = (path: string, isAdminLink: boolean = false): string => {
    const currentPath = route.path;
    const isRootHome = path === '/' && currentPath === '/';
    const isSubRouteActive = path !== '/' && currentPath.startsWith(path);
    const isActiveLink = isRootHome || isSubRouteActive;
    
    const alignmentClasses = 'flex items-center space-x-2 justify-center w-40';
    
    if (isActiveLink) {
        if (isAdminLink) {
            return `bg-white border-b-4 border-bd-gold-accent text-bd-purple-dark ${alignmentClasses}`;
        }
        return `bg-bd-purple-dark-hover border-b-4 border-bd-gold-accent text-white ${alignmentClasses}`; 
    }
    if (isAdminLink) {
        return `bg-white text-bd-purple-dark ${alignmentClasses}`;
    }
    return `text-white ${alignmentClasses}`; 
};
</script>

<style scoped>
.main-background {
    background-color: #f4f7f6; 
}

/* (Paleta de colores sin cambios) */
.bg-bd-purple-dark { background-color: #4A148C; } 
.text-bd-purple-dark { color: #4A148C; }
.border-bd-purple-dark { border-color: #4A148C; }
.bg-bd-purple-light { background-color: #AB47BC; } 
.text-bd-purple-light { color: #AB47BC; }
.border-bd-purple-light { border-color: #AB47BC; }
.bg-purple-deep { background-color: #5C2A72; }
.text-purple-deep { color: #5C2A72; }
.bg-purple-light { background-color: #6C3483; }
.text-bd-gold-accent { color: #FFD700; }
.bg-bd-purple-dark-hover { background-color: #6A1B9A; } 
.bg-bd-gold-accent { background-color: #FFC107; } 
.border-bd-gold-accent { border-color: #FFC107; }
.bg-dark-gray { background-color: #34495e; }
.bg-whatsapp { background-color: #25d366; }
.logo-border {
    border: 3px solid white;
    border-radius: 6px; 
    padding: 2px;
    background-color: white; 
}
.text-green-400 { color: #4ade80; } 
.text-dark-primary-blue { color: #34495e; }
</style>