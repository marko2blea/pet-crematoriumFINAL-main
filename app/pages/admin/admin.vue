<template>
  <div>
    <!--
      Este componente <NuxtPage /> es la "ventana" donde se renderizarán
      tus páginas de admin (dashboard.vue, reservas.vue, etc.)
    -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>