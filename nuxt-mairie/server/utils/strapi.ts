// server/utils/strapi.ts — Utilitaires pour l'API Strapi 5

const CATEGORY_LABELS: Record<string, string> = {
  urbanisme: 'Urbanisme & Travaux',
  economie:  'Économie Locale',
  sante:     'Santé',
  education: 'Éducation',
  culture:   'Culture & Sport',
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

/** Génère un extrait depuis le contenu HTML si excerpt est vide */
function autoExcerpt(excerpt: string, content: string, maxLen = 200): string {
  if (excerpt?.trim()) return excerpt.trim()
  const text = (content ?? '').replace(/<[^>]*>/g, '').trim()
  return text.length <= maxLen ? text : text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…'
}

/** Transforme un item Strapi 5 Actualite → format utilisé dans Nuxt */
export function transformActualite(item: any, strapiBase: string) {
  // `coverImage` est le champ média principal. `coverImageUrl` n'est gardé que pour compatibilité historique.
  const coverImage = resolveCoverImage(item, strapiBase)
  const content    = item.content ?? ''
  const coverImageAlt =
    item?.coverImage?.data?.attributes?.alternativeText ??
    item?.coverImage?.alternativeText ??
    item?.coverImageAlt ??
    item?.title ??
    ''

  return {
    id:            item.documentId ?? String(item.id),
    slug:          item.slug,
    title:         item.title,
    excerpt:       autoExcerpt(item.excerpt, content),
    content,
    category:      item.category ?? '',
    categoryLabel: CATEGORY_LABELS[item.category] ?? item.category ?? '',
    publishedAt:   item.publishedAt,
    author:        item.auteur ?? 'Service Communication',
    coverImage,
    coverImageAlt,
    featured:      item.featured ?? false,
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
  const rawGallery = item.galerie ?? item.gallery ?? item.images ?? []
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
    content:         item.contenu ?? item.content ?? '',
    category:        item.categorie ?? item.category ?? '',
    budget:          item.budget ?? '',
    dateDebut:       item.dateDebut ?? null,
    dateFin:         item.dateFin ?? null,
    maitreOuvrage:   item.maitreOuvrage ?? '',
    financement:     item.bailleur ?? item.financement ?? '',
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

/** Transforme un item Strapi 5 Evenement → format Nuxt */
export function transformEvenement(item: any, strapiBase: string) {
  const coverImage = resolveCoverImage(item, strapiBase)
  return {
    id:          item.documentId ?? String(item.id),
    titre:       item.titre ?? '',
    description: item.description ?? '',
    dateDebut:   item.dateDebut ?? null,
    dateFin:     item.dateFin ?? null,
    dateBadge:   formatDateBadge(item.dateDebut),
    lieu:        item.lieu ?? '',
    categorie:   item.categorie ?? '',
    coverImage,
    featured:    item.featured ?? false,
    href:        '/evenements',
  }
}
