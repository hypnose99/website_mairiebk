import { strapiHeaders } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const identifier = getRouterParam(event, 'slug')

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites/${encodeURIComponent(identifier)}/view`,
    { method: 'POST', headers: strapiHeaders() },
  )

  return response?.data ?? response
})
