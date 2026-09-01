<script setup lang="ts">
// components/layout/AppFooter.vue
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Colonne 1 : Identité -->
        <div class="footer-col">
          <img :src="'/images/logo.png'" alt="Logo Mairie de Bouaké" class="footer-logo" />
          <p class="footer-desc">{{ t('footer.description') }}</p>
        </div>

        <!-- Colonne 2 : Liens rapides -->
        <div class="footer-col">
          <h4 class="footer-title">{{ t('footer.quickLinks') }}</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">{{ t('nav.accueil') }}</NuxtLink></li>
            <li><NuxtLink to="/elus">{{ t('nav.elus') }}</NuxtLink></li>
            <li><NuxtLink to="/services">{{ t('nav.services') }}</NuxtLink></li>
            <li><NuxtLink to="/projets">{{ t('nav.projets') }}</NuxtLink></li>
            <li><NuxtLink to="/actualites">{{ t('nav.actualites') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Colonne 3 : Contact -->
        <div class="footer-col">
          <h4 class="footer-title">{{ t('footer.contact') }}</h4>
          <ul class="footer-contact-list">
            <li><i class="bi bi-geo-alt-fill" /> Hôtel de Ville, Avenue de la Paix, Bouaké</li>
            <li><i class="bi bi-telephone-fill" /> +225 00 00 00 00</li>
            <li><i class="bi bi-envelope-fill" /> contact@mairie-bouake.ci</li>
          </ul>
        </div>
      </div>

      <hr class="footer-divider" />
      <p class="footer-copy">
        &copy; {{ year }} {{ t('footer.rights') }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #1a1a2e;
  color: #ccc;
  padding: 60px 0 30px;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  height: 50px;
  filter: brightness(0) invert(1);
  margin-bottom: 16px;
  display: block;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #aaa;
}

.footer-title {
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--primary-orange);
  display: inline-block;
  padding-bottom: 6px;
  margin-bottom: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li { margin-bottom: 8px; }

.footer-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover { color: var(--primary-green); }

.footer-contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 2;
  color: #aaa;
}

.footer-contact-list i {
  color: var(--primary-green);
  margin-right: 8px;
}

.footer-divider {
  border-color: rgba(255,255,255,0.1);
  margin: 0 0 20px;
}

.footer-copy {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr; gap: 30px; }
}
</style>
