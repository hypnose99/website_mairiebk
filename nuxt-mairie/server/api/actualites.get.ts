// server/api/actualites.get.ts — Actualités depuis Strapi 5
//
// Paramètres : page, perPage, category (slug), search, featured=true, fields=list
// Le tri, les filtres et la pagination sont faits par Strapi : la réponse ne
// dépend plus de la limite de 100 éléments par requête de l'API Strapi.
import { strapiFetchRange, transformActualite } from '~/server/utils/strapi'

/** Nombre maximum d'articles qu'un appel peut demander (garde-fou). */
const MAX_PER_PAGE = 500

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  const page     = Math.max(1, Number(query.page) || 1)
  const perPage  = Math.min(MAX_PER_PAGE, Math.max(1, Number(query.perPage) || 9))
  const listMode = query.fields === 'list'

  const params = new URLSearchParams()

  if (query.category) {
    params.append('filters[categorie][slug][$eq]', String(query.category))
  }
  if (query.search) {
    params.append('filters[$or][0][title][$containsi]', String(query.search))
    params.append('filters[$or][1][excerpt][$containsi]', String(query.search))
  }
  // « À la une » : seulement les articles marqués `featured` dans Strapi
  if (query.featured === 'true') {
    params.append('filters[featured][$eq]', 'true')
  }

  // Date métier d'abord, puis date de publication Strapi pour départager.
  // Tous les articles ont une date_publication (lifecycle beforeCreate +
  // migration 20260917000000 pour les anciens), le tri Strapi est donc fiable.
  params.append('sort[0]', 'date_publication:desc')
  params.append('sort[1]', 'publishedAt:desc')

  // Mode « liste » : pas besoin de la galerie, qui pèse l'essentiel de la réponse.
  params.append('populate[coverImage]', 'true')
  params.append('populate[categorie]', 'true')
  if (!listMode) params.append('populate[gallery]', 'true')

  try {
    const { items, total } = await strapiFetchRange('actualites', params, {
      start: (page - 1) * perPage,
      limit: perPage,
    })

    let result = items.map((item: any) => transformActualite(item, config.strapiUrl))

    // Mode liste : on ne renvoie que ce qu'une carte affiche.
    // Le détail d'un article passe par /api/actualites/[slug], qui renvoie tout.
    if (listMode) {
      result = result.map(({ content, gallery, ...card }: any) => card)
    }

    return { items: result, total, page, perPage }
  }
  catch (err: any) {
    // Ne jamais faire tomber la page : on log et on renvoie une liste vide
    // (même comportement que /api/evenements et /api/flash-info)
    console.error('[api/actualites] Strapi error:', err?.statusCode ?? err?.message)
    return { items: [], total: 0, page, perPage }
  }
}, {
  // Mise en cache courte de la réponse.
  // ⚠️ `getKey` inclut la query string : par défaut Nitro ne garde que le chemin,
  // si bien que /api/actualites?a=1 et /api/actualites?a=2 partageaient la même entrée de
  // cache et renvoyaient le même contenu.
  maxAge: 300,
  swr: true,
  getKey: event => event.path,
  // En développement, pas de cache : un contenu modifié dans Strapi apparaît
  // immédiatement au rechargement de la page.
  shouldBypassCache: () => import.meta.dev,
})
