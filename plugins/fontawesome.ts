import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// --- Importaciones de Íconos ---
import { 
    faHome, faUsers, faCogs, 
    faBoxes, faPlus, faEdit, faTrash, 
    faFeatherAlt, faPaperPlane, faQuoteLeft, faClock, faCloudSun, faHandHoldingHeart, faChevronDown, faPaw, faPlusCircle,
    faFilter, faShoppingCart, faHeart, faBox, faQuestionCircle, faEllipsisV,
    faHandshake, faCreditCard, faUniversity, faArrowRight, faUser, faUserCog, faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { 
    faFacebook, faInstagram, faWhatsapp, faCcVisa, faCcMastercard 
} from '@fortawesome/free-brands-svg-icons';
import { defineNuxtPlugin } from 'nuxt/app';

// Añadir todos los íconos a la librería
library.add(
    faHome, faUsers, faCogs, 
    faBoxes, faPlus, faEdit, faTrash, 
    faFeatherAlt, faPaperPlane, faQuoteLeft, faClock, faCloudSun, faHandHoldingHeart, faChevronDown, faPaw, faPlusCircle,
    faFilter, faShoppingCart, faHeart, faBox, faQuestionCircle, faEllipsisV,
    faHandshake, faCreditCard, faUsers, faClock, faArrowRight, faUniversity, faUser, faUserCog, faArrowUp, faArrowDown,
    faFacebook, faInstagram, faWhatsapp, faCcVisa, faCcMastercard
);

config.autoAddCss = false;


// Aquí usamos defineNuxtPlugin, que Nuxt inyecta automáticamente.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon);
});
//defineNuxtPlugin((nuxtApp)