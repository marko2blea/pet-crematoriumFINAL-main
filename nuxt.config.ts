export default defineNuxtConfig({
  // CORRECCIÓN CLAVE 1: Configura 'app/' como la carpeta fuente principal para 'pages' y 'layouts'.
  srcDir: 'app/',
  
  // CORRECCIÓN CLAVE 2: Anula el comportamiento de srcDir para la carpeta 'plugins'.
  // Esto le dice a Nuxt: busca plugins en la raíz del proyecto (donde está nuxt.config.ts).
  dir: {
    plugins: '../plugins' // Sube un nivel desde 'app/' para encontrar la carpeta 'plugins'
  },
  
  app: {
    head: {
      link: [
        // Enlace para cargar la fuente 'Quicksand' desde Google Fonts
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap'
        }
      ]
    }
  },
  
  // ¡ESTO ARREGLA LOS ÍCONOS! Carga global del CSS de Font Awesome.
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css' 
  ],
  
  modules: [
    '@nuxtjs/tailwindcss' 
  ],
  
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})