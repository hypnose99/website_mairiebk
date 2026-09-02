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
      { code: 'dioula', language: 'dyu-CI', name: 'Dioula',   file: 'dioula.json', dir: 'ltr' },
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
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/icon-96x96.png' },
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
      siteUrl:   process.env.SITE_URL  || 'https://mairie-bouake.ci',
      apiBase:   process.env.API_BASE  || '/api',
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    },
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────
  plugins: [
    '~/plugins/bootstrap.client.ts',
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
