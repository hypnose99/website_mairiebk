// server/api/actualites.get.ts — Actualités depuis Strapi 5
import { strapiHeaders, transformActualite } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  const params = new URLSearchParams()

  if (query.category) {
    params.append('filters[category][$eq]', query.category as string)
  }
  if (query.search) {
    params.append('filters[$or][0][title][$containsi]', query.search as string)
    params.append('filters[$or][1][excerpt][$containsi]', query.search as string)
  }

  params.append('sort[0]', 'publishedAt:desc')

  const page    = Number(query.page)    || 1
  const perPage = Number(query.perPage) || 9
  params.append('pagination[page]',     String(page))
  params.append('pagination[pageSize]', String(perPage))

  params.append('populate', '*')

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites?${params}`,
    { headers: strapiHeaders() }
  )

  const items = (response.data ?? []).map((item: any) =>
    transformActualite(item, config.strapiUrl)
  )

  return {
    items,
    total:   response.meta?.pagination?.total    ?? items.length,
    page:    response.meta?.pagination?.page     ?? page,
    perPage: response.meta?.pagination?.pageSize ?? perPage,
  }
})
