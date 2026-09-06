// server/api/actualites.get.ts — Actualités depuis Strapi 5
import { strapiHeaders, transformActualite } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  const params = new URLSearchParams()

  if (query.category) {
    params.append('filters[categorie][slug][$eq]', query.category as string)
  }
  if (query.search) {
    params.append('filters[$or][0][title][$containsi]', query.search as string)
    params.append('filters[$or][1][excerpt][$containsi]', query.search as string)
  }

  // La date métier est prioritaire ; publishedAt reste le second critère pour
  // les anciens articles qui n'ont pas encore de date_publication.
  const page    = Number(query.page)    || 1
  const perPage = Number(query.perPage) || 9
  // Strapi ne permet pas de trier correctement une date personnalisée avec
  // fallback quand certaines lignes ont une valeur NULL. On récupère les
  // articles filtrés, puis on trie sur la date réellement affichée.
  params.append('pagination[page]', '1')
  params.append('pagination[pageSize]', '1000')

  params.append('populate', '*')

  try {
    const response = await $fetch<any>(
      `${config.strapiUrl}/api/actualites?${params}`,
      { headers: strapiHeaders() }
    )

    const items = (response.data ?? []).map((item: any) =>
      transformActualite(item, config.strapiUrl)
    )
    let sortedItems = items.sort((a: any, b: any) => {
      const dateA = new Date(a.date_publication || a.publishedAt || 0).getTime()
      const dateB = new Date(b.date_publication || b.publishedAt || 0).getTime()
      return dateB - dateA
    })
    // "À la une" : ne garder que les articles marqués `featured` dans Strapi
    if (query.featured === 'true') {
      sortedItems = sortedItems.filter((a: any) => a.featured)
    }
    const start = (page - 1) * perPage
    const paginatedItems = sortedItems.slice(start, start + perPage)

    return {
      items:   paginatedItems,
      total:   sortedItems.length,
      page,
      perPage,
    }
  }
  catch (err: any) {
    // Ne jamais faire tomber la page : on log et on renvoie une liste vide
    // (même comportement que /api/evenements et /api/flash-info)
    console.error('[api/actualites] Strapi error:', err?.statusCode ?? err?.message)
    return { items: [], total: 0, page, perPage }
  }
})
