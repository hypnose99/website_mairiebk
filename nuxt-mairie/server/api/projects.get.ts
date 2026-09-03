// server/api/projects.get.ts — Projets municipaux depuis Strapi 5 (fallback JSON local)
import { strapiHeaders, transformProject } from '~/server/utils/strapi'
import projectsData from '~/data/projects.json'
import type { ProjectStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  try {
    const params = new URLSearchParams()

    if (query.status) {
      // Le front utilise "en_cours", Strapi stocke "en-cours"
      params.append('filters[statut][$eq]', (query.status as string).replace(/_/g, '-'))
    }
    if (query.category) {
      params.append('filters[categorie][$eq]', query.category as string)
    }
    if (query.search) {
      params.append('filters[$or][0][titre][$containsi]',  query.search as string)
      params.append('filters[$or][1][resume][$containsi]', query.search as string)
    }

    params.append('sort[0]', 'publishedAt:desc')
    params.append('pagination[pageSize]', String(Number(query.perPage) || 100))
    if (query.detail) {
      params.append('populate[0]', 'image')
      params.append('populate[1]', 'galerie')
    }
    else {
      params.append('populate', 'image')
    }

    if (query.slug) {
      params.append('filters[documentId][$eq]', query.slug as string)
    }

    const response = await $fetch<any>(
      `${config.strapiUrl}/api/projets?${params}`,
      { headers: strapiHeaders() }
    )

    return (response.data ?? []).map((item: any) =>
      transformProject(item, config.strapiUrl)
    )
  }
  catch {
    // ── Fallback : données locales si Strapi indisponible ──
    let results = [...projectsData]

    if (query.status) {
      results = results.filter(p => p.status === query.status as ProjectStatus)
    }
    if (query.search) {
      const term = (query.search as string).toLowerCase()
      results = results.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(t => t.includes(term))
      )
    }

    return results
  }
})
