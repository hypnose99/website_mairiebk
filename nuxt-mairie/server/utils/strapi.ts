// server/utils/strapi.ts — Utilitaires pour l'API Strapi 5

import { extractPlainText } from '~/utils/content'

/** Génère un slug stable lorsque Strapi renvoie un slug vide. */
export function slugify(value: unknown): string {
  if (typeof value !== 'string') return ''

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function actualiteSlug(item: any): string {
  const slug = typeof item?.slug === 'string' ? item.slug.trim() : ''
  return slugify(item?.title) || slug || item?.documentId || String(item?.id ?? '')
}

/** Headers d'authentification Strapi */
export function strapiHeaders() {
  const config = useRuntimeConfig()
  return {
    'Authorization': `Bearer ${config.strapiToken}`,
    'Content-Type':  'application/json',
  }
}

/** Construit l'URL complète d'un media Strapi (local ou Cloudinary).
 * Strapi 5 renvoie souvent des médias sous la forme { data: { attributes: { url, alternativeText } } }.
 */
export function mediaUrl(media: any, strapiBase: string): string | null {
  if (!media) return null

  const raw = media.data ?? media
  if (typeof raw === 'string') return raw

  const url = raw?.attributes?.url ?? raw?.url
  if (!url) return null

  return url.startsWith('http') ? url : `${strapiBase}${url}`
}

/** Compatibilité historique : `coverImage` est le champ principal. `coverImageUrl` reste un fallback ancien. */
function resolveCoverImage(item: any, strapiBase: string): string | null {
  return mediaUrl(item?.coverImage, strapiBase) ?? mediaUrl(item?.image, strapiBase) ?? item?.coverImageUrl ?? item?.imageUrl ?? null
}

/** Génère un extrait depuis un résumé ou un contenu Strapi Blocks/HTML. */
function autoExcerpt(excerpt: unknown, content: unknown, maxLen = 100): string {
  const excerptText = extractPlainText(excerpt)
  if (excerptText) return excerptText.substring(0, maxLen) + (excerptText.length > maxLen ? '...' : '')

  const text = extractPlainText(content)
  return text.substring(0, maxLen) + (text.length > maxLen ? '...' : '')
}

/** Transforme un item Strapi 5 Actualite → format utilisé dans Nuxt */
export function transformActualite(item: any, strapiBase: string) {
  // `coverImage` est le champ média principal. `coverImageUrl` n'est gardé que pour compatibilité historique.
  const coverImage = resolveCoverImage(item, strapiBase)
  const content    = item.content ?? item.contenu ?? ''
  const coverImageAlt =
    item?.coverImage?.data?.attributes?.alternativeText ??
    item?.coverImage?.alternativeText ??
    item?.coverImageAlt ??
    item?.title ??
    ''

  return {
    id:            item.documentId ?? String(item.id),
    slug:          actualiteSlug(item),
    title:         item.title,
    excerpt:       autoExcerpt(item.excerpt, content),
    content,
    category:      item.categorie?.slug ?? '',
    categoryLabel: item.categorie?.nom ?? '',
    categoryColor: item.categorie?.couleur ?? null,
    date_publication: item.date_publication ?? null,
    publishedAt:   item.publishedAt,
    author:        item.auteur ?? 'Service Communication',
    coverImage,
    coverImageAlt,
    featured:      item.featured ?? false,
    views:         Number(item.views) || 0,
    likes:         Number(item.likes) || 0,
    tags:          item.tags ?? [],
    videoUrl:      item.videoUrl ?? null,
    gallery:       (item.gallery ?? []).map((g: any) => ({ url: mediaUrl(g, strapiBase) })),
  }
}

/** Transforme un item Strapi 5 Projet → format utilisé dans Nuxt
 *  Champs Strapi : titre, resume, contenu, categorie, statut ("en-cours"…),
 *  budget, progression, featured, coverImageUrl, gallery (optionnel)
 */
export function transformProject(item: any, strapiBase: string) {
  const title = item.titre ?? item.title ?? ''

  // Galerie : médias uploadés (galerie/gallery/images) ou URLs texte temporaires (imagesUrls JSON)
  const rawGallery = item.galerie?.data ?? item.galerie ?? item.gallery?.data ?? item.gallery ?? item.images ?? []
  const mediaImages = (Array.isArray(rawGallery) ? rawGallery : []).map((g: any) => ({
    src:     mediaUrl(g, strapiBase),
    alt:     g.alternativeText ?? title,
    caption: g.caption ?? '',
  })).filter((img: any) => img.src)

  const urlImages = Array.isArray(item.imagesUrls) ? item.imagesUrls : []
  let images = mediaImages.length ? mediaImages : urlImages

  const coverImage =
    resolveCoverImage(item, strapiBase) ??
    images[0]?.src ??
    null

  // Sécurité : jamais de galerie vide si une cover existe
  if (!images.length && coverImage) {
    images = [{ src: coverImage, alt: title, caption: '' }]
  }

  // "en-cours" → "en_cours" (normalisation pour le front)
  const status = String(item.statut ?? item.statusProjet ?? item.status ?? 'en_cours')
    .replace(/-/g, '_')

  return {
    id:              item.documentId ?? String(item.id),
    slug:            item.slug ?? item.documentId ?? String(item.id),
    title,
    description:     item.resume ?? item.description ?? '',
    resume:          item.resume ?? item.description ?? '',
    content:         item.contenu ?? item.content ?? '',
    category:        item.categorie ?? item.category ?? '',
    budget:          item.budget ?? '',
    dateDebut:       item.dateDebut ?? item.date_debut ?? null,
    dateFin:         item.dateFin ?? item.date_fin ?? null,
    maitreOuvrage:   item.maitreOuvrage ?? item.maitre_ouvrage ?? '',
    financement:     item.bailleur ?? item.bailleurs ?? item.financement ?? '',
    bailleurs:       item.bailleurs ?? item.bailleur ?? '',
    entreprises:     item.entreprises ?? '',
    livraisonPrevue: item.livraisonPrevue ?? '',
    progressPercent: item.progression ?? item.progressPercent ?? 0,
    status,
    featured:        item.featured ?? false,
    tags:            item.tags ?? [],
    coverImage,
    images,
    videoUrl:        item.videoUrl ?? null,
    publishedAt:     item.publishedAt ?? null,
  }
}

/** Transforme un item Strapi 5 FlashInfo → format Nuxt */
export function transformFlashInfo(item: any) {
  return {
    id:      item.documentId ?? String(item.id),
    titre:   item.titre,
    contenu: item.contenu,
    type:    item.type ?? 'info',
    actif:   item.actif ?? true,
    datePublication: item.datePublication ?? item.publishedAt ?? null,
    image:   mediaUrl(item.image, useRuntimeConfig().strapiUrl),
  }
}

/** Formate une date Strapi en badge court ex: "12 OCT" */
function formatDateBadge(dt: string): string {
  if (!dt) return ''
  const d = new Date(dt)
  const day   = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '')
  return `${day} ${month}`
}

function formatTime(dt: string | null): string {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** Transforme un item Strapi 5 Evenement → format Nuxt */
export function transformEvenement(item: any, strapiBase: string) {
  const coverImage = resolveCoverImage(item, strapiBase)
  return {
    id:          item.documentId ?? String(item.id),
    titre:       item.titre ?? '',
    description: item.description ?? '',
    contenu:     item.contenu ?? item.description ?? '',
    dateDebut:   item.dateDebut ?? null,
    dateFin:     item.dateFin ?? null,
    dateBadge:   formatDateBadge(item.dateDebut),
    heure:       formatTime(item.dateDebut),
    lieu:        item.lieu ?? '',
    categorie:   item.categorie ?? '',
    image:       coverImage,
    coverImage,
    featured:    item.featured ?? false,
    href:        '/evenements',
  }
}
