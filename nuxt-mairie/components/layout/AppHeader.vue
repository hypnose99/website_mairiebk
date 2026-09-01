<script setup lang="ts">
// components/layout/AppHeader.vue
import { useAppStore } from '~/stores/useAppStore'

const appStore = useAppStore()
const { isMobileMenuOpen } = storeToRefs(appStore)
const route = useRoute()
const { locale, locales, setLocale, t } = useI18n()

const navItems = [
  { to: '/', labelKey: 'nav.accueil' },
  { to: '/elus', labelKey: 'nav.elus' },
  { to: '/services', labelKey: 'nav.services' },
  { to: '/projets', labelKey: 'nav.projets' },
  { to: '/actualites', labelKey: 'nav.actualites' },
  { to: '/opportunites', labelKey: 'nav.opportunites' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// Ferme le menu mobile à chaque changement de route
watch(() => route.path, () => appStore.closeMobileMenu())
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="header-logo" :aria-label="t('nav.accueil')">
        <img :src="'/images/logo.png'" :alt="t('header.logoAlt')" class="logo-img" />
      </NuxtLink>

      <!-- Navigation desktop -->
      <nav class="header-nav" :aria-label="t('nav.ariaLabel')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <!-- Sélecteur de langue -->
      <div class="header-actions">
        <div class="lang-switcher">
          <button
            v-for="loc in locales"
            :key="loc.code"
            class="lang-btn"
            :class="{ 'lang-btn--active': locale === loc.code }"
            @click="setLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </button>
        </div>

        <!-- Burger mobile -->
        <button
          class="burger-btn"
          :aria-expanded="isMobileMenuOpen"
          :aria-label="isMobileMenuOpen ? t('nav.close') : t('nav.open')"
          @click="appStore.toggleMobileMenu()"
        >
          <span class="burger-line" />
          <span class="burger-line" />
          <span class="burger-line" />
        </button>
      </div>
    </div>

    <!-- Menu mobile (drawer) -->
    <Transition name="slide-down">
      <nav v-if="isMobileMenuOpen" class="mobile-menu" :aria-label="t('nav.mobileAriaLabel')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="mobile-nav-link"
          :class="{ active: isActive(item.to) }"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.header-inner {
  display: flex;
  align-items: center;
  padding: 0 50px;
  height: 90px;
}

.header-logo {
  flex-shrink: 0;
  margin-right: 40px;
}

.logo-img {
  height: 60px;
  display: block;
}

.header-nav {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  margin: 0 15px;
  font-size: 16px;
  text-transform: uppercase;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-green);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.lang-switcher {
  display: flex;
  gap: 4px;
}

.lang-btn {
  padding: 3px 8px;
  border: 1px solid #ddd;
  background: transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.lang-btn--active {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
}

/* Burger */
.burger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.burger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: transform 0.3s;
}

/* Mobile menu */
.mobile-menu {
  display: flex;
  flex-direction: column;
  background: white;
  border-top: 1px solid #f0f0f0;
  padding: 10px 0;
}

.mobile-nav-link {
  padding: 14px 30px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 15px;
  text-transform: uppercase;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-nav-link.active { color: var(--primary-green); }

/* Transition slide-down */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 992px) {
  .header-inner { padding: 0 20px; }
  .header-nav { display: none; }
  .burger-btn { display: flex; }
}
</style>
