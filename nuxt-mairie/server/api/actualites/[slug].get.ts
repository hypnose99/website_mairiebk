// server/api/actualites/[slug].get.ts — Article par slug depuis Strapi 5
import { actualiteSlug, strapiHeaders, transformActualite } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug   = getRouterParam(event, 'slug')

  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  const params = new URLSearchParams()
  params.append('filters[slug][$eq]',        slug as string)
  params.append('populate', '*')

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites?${params}`,
    { headers: strapiHeaders() }
  )

  let item = response.data?.[0]

  // Les anciens articles peuvent avoir un slug vide. On compare alors le slug
  // calculé depuis le titre avec celui utilisé par les liens du frontend.
  if (!item) {
    const fallbackParams = new URLSearchParams({
      'pagination[pageSize]': '100',
      populate: '*',
    })
    const fallbackResponse = await $fetch<any>(
      `${config.strapiUrl}/api/actualites?${fallbackParams}`,
      { headers: strapiHeaders() }
    )
    item = (fallbackResponse.data ?? []).find((candidate: any) =>
      actualiteSlug(candidate) === slug ||
      candidate.documentId === slug ||
      String(candidate.id) === slug
    )
  }

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  return transformActualite(item, config.strapiUrl)
})
