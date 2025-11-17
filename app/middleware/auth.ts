/**
 * Guardián de rutas (Middleware) de Nuxt.
 * Se aplica a CUALQUIER página que tenga `definePageMeta({ middleware: 'auth' })`
 */
export default defineNuxtRouteMiddleware((to, from) => {
  
  // 1. Obtener el estado global del usuario (auto-importado)
  const user = useUser();

  // --- REGLA 1: No está logueado ---
  // Si no hay usuario (user.value es null), lo expulsamos a /login.
  if (!user.value) {
    return navigateTo(`/login?redirectTo=${to.fullPath}`);
  }

  // --- REGLA 2: Es un Cliente intentando entrar a /admin ---
  // Revisamos si la ruta a la que intenta ir (to.path) comienza con '/admin'
  const isAdminRoute = to.path.startsWith('/admin');
  
  // Revisamos si el usuario es un Cliente (Rol 1)
  const isClient = user.value.id_rol === 1;

  if (isAdminRoute && isClient) {
    // Si ES una ruta de admin Y ES un cliente...
    // Lo expulsamos a la página de inicio.
    return navigateTo('/'); 
  }

  // --- REGLA 3: Dejar pasar ---
  // Si llegamos aquí, el usuario SÍ puede pasar:
  // - Es un Admin (isClient = false) en una ruta de Admin (isAdminRoute = true).
  // - Es un Cliente (isClient = true) en una ruta NO-Admin (ej: /reserva) (isAdminRoute = false).
  // - Es un Admin (isClient = false) en una ruta NO-Admin (ej: /reserva).
});