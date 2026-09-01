// server/api/actualites/[slug].get.ts — Article par slug depuis Strapi 5
import { strapiHeaders, transformActualite } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug   = getRouterParam(event, 'slug')

  const params = new URLSearchParams()
  params.append('filters[slug][$eq]',        slug as string)
  params.append('populate', '*')

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites?${params}`,
    { headers: strapiHeaders() }
  )

  const item = response.data?.[0]
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  return transformActualite(item, config.strapiUrl)
})
