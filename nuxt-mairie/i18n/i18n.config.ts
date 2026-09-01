// i18n/i18n.config.ts — Configuration vue-i18n pour Nuxt
import { defineI18nConfig } from '#i18n'

export default defineI18nConfig(() => ({
  legacy: false,           // Composition API mode
  locale: 'fr',
  fallbackLocale: 'fr',
  missingWarn: false,      // Silencieux en prod si clé manquante
  fallbackWarn: false,

  // Formats de dates et nombres pour la Côte d'Ivoire
  datetimeFormats: {
    fr: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: 'numeric', minute: 'numeric',
      },
      monthYear: { year: 'numeric', month: 'long' },
    },
    dioula: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
    },
  },

  numberFormats: {
    fr: {
      currency: {
        style: 'currency',
        currency: 'XOF',   // Franc CFA
        currencyDisplay: 'symbol',
        minimumFractionDigits: 0,
      },
      decimal: { style: 'decimal', minimumFractionDigits: 0 },
      percent: { style: 'percent', useGrouping: false },
    },
    dioula: {
      currency: {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
      },
    },
  },
}))
