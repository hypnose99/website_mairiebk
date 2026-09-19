// nuxt.config.ts — Configuration principale de la Mairie de Bouaké
export default defineNuxtConfig({

  // ─── Rendu SSR ────────────────────────────────────────────────────────────
  ssr: true,

  // ─── Modules ──────────────────────────────────────────────────────────────
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'nuxt-strapi-blocks-renderer',
  ],

  // ─── i18n ─────────────────────────────────────────────────────────────────
  i18n: {
    locales: [
      { code: 'fr',     language: 'fr-CI',  name: 'Français', file: 'fr.json',     dir: 'ltr' },
      { code: 'en',     language: 'en-US', name: 'English',  file: 'en.json',     dir: 'ltr' },
    ],
    defaultLocale: 'fr',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mairie_locale',
      redirectOn: 'root',
    },
  },

  // ─── CSS Global ───────────────────────────────────────────────────────────
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css',
  ],

  // ─── Head global ──────────────────────────────────────────────────────────
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'fr' },
      title: 'Mairie de Bouaké — Site Officiel',
      titleTemplate: '%s | Mairie de Bouaké',
      meta: [
        { name: 'description', content: 'Site officiel de la Mairie de Bouaké. Retrouvez vos démarches administratives, les actualités et les projets de la commune.' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mairie de Bouaké' },
        { property: 'og:locale', content: 'fr_CI' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#009640' },
      ],
      link: [
        // Icône d'onglet : le .ico embarque 16/32/48 px (c'est lui que Chrome
        // lit en priorité), le PNG sert aux écrans à forte densité.
        { rel: 'icon', type: 'image/x-icon', href: '/icons/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/icons/icon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // ─── Vite ─────────────────────────────────────────────────────────────────
  vite: {
    vue: {
      template: { transformAssetUrls: false },
    },
  },

  // ─── Runtime Config ───────────────────────────────────────────────────────
  runtimeConfig: {
    strapiUrl:   process.env.STRAPI_URL   || 'http://localhost:1337',
    strapiToken: process.env.STRAPI_TOKEN || '',
    public: {
      // Adresse publique du site : sert aux liens canoniques, au partage et au sitemap
      siteUrl:   process.env.SITE_URL  || 'https://www.mairiedebouake.ci',
      apiBase:   process.env.API_BASE  || '/api',
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      // Balise Google (Analytics 4 / Tag Manager) — vide = aucune mesure
      googleTagId: process.env.GOOGLE_TAG_ID || '',
      // Code de validation Google Search Console (méthode « balise HTML »)
      googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────
  plugins: [
    '~/plugins/bootstrap.client.ts',
    '~/plugins/google-tag.client.ts',
  ],

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    strict: true,
    typeCheck: false,
  },

  // ─── Nitro ────────────────────────────────────────────────────────────────
  nitro: {
    compressPublicAssets: true,
  },

  compatibilityDate: '2024-10-01',
})
