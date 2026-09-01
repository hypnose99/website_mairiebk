// utils/index.ts — Fonctions utilitaires partagées

/**
 * Génère le suffixe ordinal pour le rang d'un adjoint
 */
export const ordinalRank = (rank: number): string => {
  if (rank === 1) return '1er'
  return `${rank}ème`
}

/**
 * Tronque un texte à une longueur donnée
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Convertit un slug kebab-case en titre lisible
 */
export const slugToTitle = (slug: string): string =>
  slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

/**
 * Vérifie si une URL est externe
 */
export const isExternalUrl = (url: string): boolean =>
  url.startsWith('http') || url.startsWith('//')

/**
 * Formate un nombre en pourcentage affiché
 */
export const formatPercent = (value: number): string => `${Math.round(value)}%`
