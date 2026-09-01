<script setup lang="ts">
// layouts/default.vue — Layout principal partagé par toutes les pages
</script>

<template>
  <div class="layout-wrapper">
    <LayoutAppHeader />

    <main class="layout-main" id="main-content">
      <!-- Lien d'évitement pour accessibilité -->
      <a href="#main-content" class="skip-link">Aller au contenu principal</a>
      <slot />
    </main>

    <LayoutAppFooter />
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  padding-top: 90px; /* Hauteur du header fixe */
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--primary-green);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: 600;
  z-index: 10000;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
</style>
