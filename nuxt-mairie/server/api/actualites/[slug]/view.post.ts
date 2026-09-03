import { strapiHeaders } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const identifier = getRouterParam(event, 'slug')

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  return $fetch(
    `${config.strapiUrl}/api/actualites/${encodeURIComponent(identifier)}/view`,
    { method: 'POST', headers: strapiHeaders() },
  )
})
