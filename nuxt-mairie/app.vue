<script setup lang="ts">
// app.vue — Point d'entrée de l'application Nuxt
// Gestion des notifications globales (offline, mises à jour PWA)
import { useAppStore } from '~/stores/useAppStore'

const appStore = useAppStore()
const { isOffline, activeNotifications } = storeToRefs(appStore)
</script>

<template>
  <div id="app">
    <!-- Bannière hors ligne -->
    <Transition name="slide-down">
      <div v-if="isOffline" class="offline-banner" role="alert">
        <i class="bi bi-wifi-off" />
        Vous êtes hors ligne — Certaines informations peuvent ne pas être à jour.
      </div>
    </Transition>

    <!-- Notifications -->
    <div class="notifications-container" aria-live="polite">
      <Transition v-for="notif in activeNotifications" :key="notif.id" name="notif">
        <div class="app-notification" :class="`app-notification--${notif.type}`">
          {{ notif.message }}
          <button class="notif-close" @click="appStore.removeNotification(notif.id)">
            <i class="bi bi-x" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Rendu des layouts/pages -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Styles globaux de l'application */
#app { min-height: 100vh; display: flex; flex-direction: column; }

.offline-banner {
  background: #e65100;
  color: white;
  text-align: center;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  position: fixed;
  top: 0; left: 0; width: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.notifications-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
}

.app-notification {
  padding: 14px 40px 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  color: white;
}
.app-notification--info { background: #1565c0; }
.app-notification--success { background: #009640; }
.app-notification--warning { background: #f57c00; }
.app-notification--error { background: #c62828; }

.notif-close {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
}

/* Transitions de page */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.notif-enter-active, .notif-leave-active { transition: all 0.3s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateX(20px); }
</style>
