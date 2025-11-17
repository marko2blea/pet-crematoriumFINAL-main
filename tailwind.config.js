/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Asegúrate de que esta línea contenga la ruta a tus archivos Vue para que Tailwind sepa qué clases usar.
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // AÑADIDO: Define 'Quicksand' como la fuente sans principal.
        sans: ['Quicksand', 'sans-serif'], 
      },
      // Puedes añadir aquí tus colores de marca personalizados (opcional)
      colors: {
        'primary-dark': '#5d4037', // Marrón/Carbón del Crematorio
        'cyan-700': '#17a2b8',    // Celeste Oscuro
        'bg-dark-gray': '#343a40', // Gris para el Footer
        
      }
    },
  },
  plugins: [],
}
