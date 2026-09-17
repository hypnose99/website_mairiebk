// server/api/actualites/[slug]/view.post.ts — Compte une vue (limitée par visiteur)
import { strapiHeaders } from '~/server/utils/strapi'
import { clientIp, enforceRateLimit, hit } from '~/server/utils/rate-limit'

const HOUR = 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const identifier = getRouterParam(event, 'slug')

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  const ip = clientIp(event)
  // Une seule vue comptée par visiteur et par article toutes les 6 heures.
  // Au-delà, on renvoie les compteurs actuels sans les incrémenter.
  enforceRateLimit(event, `view:ip:${ip}`, 120, HOUR)
  if (!hit(`view:${ip}:${identifier}`, 1, 6 * HOUR)) {
    const params = new URLSearchParams({
      'filters[$or][0][slug][$eq]': identifier,
      'filters[$or][1][documentId][$eq]': identifier,
      'fields[0]': 'views',
      'fields[1]': 'likes',
      'pagination[limit]': '1',
    })
    const current = await $fetch<any>(
      `${config.strapiUrl}/api/actualites?${params}`,
      { headers: strapiHeaders() },
    ).catch(() => null)
    const doc = current?.data?.[0]
    return { views: Number(doc?.views) || 0, likes: Number(doc?.likes) || 0 }
  }

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites/${encodeURIComponent(identifier)}/view`,
    { method: 'POST', headers: strapiHeaders() },
  )

  return response?.data ?? response
})
