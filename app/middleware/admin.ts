/**
 * Middleware de Autorización:
 * Solo permite el acceso a usuarios que han iniciado sesión Y tienen rol de Admin.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Obtener el estado del usuario
  const user = useUser();

  // 2. Si no hay usuario (no logueado), redirigir a login.
  if (!user.value) {
    return navigateTo('/login');
  }

  // 3. Si el usuario es 'Cliente' (Rol 1), redirigir a la página principal.
  if (user.value.id_rol === 1) {
    // (Opcional) Puedes redirigir a una página de 'acceso-denegado'
    return navigateTo('/'); 
  }

  // 4. Si es Rol 2 (Admin) o superior, permitir el acceso.
});