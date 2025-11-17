import { computed } from 'vue';
// Importamos el tipo 'User' que definimos en 'app/types/index.ts'
// (El error 'Cannot find module' desaparecerá después de 'npx nuxi prepare')
import type { User } from '../../app/types';

/**
 * Este es el composable de autenticación.
 * * (CORREGIDO) Usamos 'useCookie' en lugar de 'useState'.
 * Esto hace que la sesión del usuario persista (se guarde)
 * entre recargas de página y navegaciones.
 */
export const useUser = () => {
  
  // 1. Usar useCookie. 'auth-user' es el nombre de la cookie.
  const user = useCookie<User | null>('auth-user', { 
    default: () => null,
    maxAge: 60 * 60 * 24 * 7 // La sesión durará 7 días
  });

  // 2. Devolver el 'ref' de la cookie.
  // Ahora, cuando hagas 'user.value = response.user' en login.vue, se guardará la cookie.
  // Cuando hagas 'user.value = null' en logout, se borrará la cookie.
  return user;
};