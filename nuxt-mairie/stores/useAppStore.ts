// stores/useAppStore.ts — Store global Pinia (état de l'application)
import { defineStore } from 'pinia'
import type { AppNotification } from '~/types'

export const useAppStore = defineStore('app', () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const isMobileMenuOpen = ref(false)
  const notifications = ref<AppNotification[]>([])
  const isOffline = ref(false)
  const lastVisitedRoute = ref<string>('/')

  // ─── Getters ─────────────────────────────────────────────────────────────
  const hasNotifications = computed(() => notifications.value.length > 0)
  const activeNotifications = computed(() =>
    notifications.value.filter(n => n.type !== 'error').slice(0, 3)
  )

  // ─── Actions ─────────────────────────────────────────────────────────────
  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  function addNotification(notification: Omit<AppNotification, 'id'>) {
    const id = `notif-${Date.now()}`
    notifications.value.push({ ...notification, id })

    // Auto-dismiss si configuré
    if (notification.autoDismiss) {
      setTimeout(() => removeNotification(id), notification.autoDismiss)
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }

  function setOfflineStatus(status: boolean) {
    isOffline.value = status
    if (status) {
      addNotification({
        type: 'warning',
        message: 'Vous êtes hors ligne. Certaines informations peuvent ne pas être à jour.',
        autoDismiss: 8000,
      })
    }
  }

  // ─── Initialisation (détection réseau) ────────────────────────────────────
  if (import.meta.client) {
    window.addEventListener('online', () => setOfflineStatus(false))
    window.addEventListener('offline', () => setOfflineStatus(true))
    isOffline.value = !navigator.onLine
  }

  return {
    isMobileMenuOpen,
    notifications,
    isOffline,
    lastVisitedRoute,
    hasNotifications,
    activeNotifications,
    toggleMobileMenu,
    closeMobileMenu,
    addNotification,
    removeNotification,
    setOfflineStatus,
  }
})
