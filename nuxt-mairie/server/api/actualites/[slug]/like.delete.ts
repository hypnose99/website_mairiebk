// server/api/actualites/[slug]/like.delete.ts — Retire un « j'aime » (limité par visiteur)
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
  // « J'aime » / « Je n'aime plus » : quelques changements par article,
  // et un plafond global par visiteur, pour empêcher les boucles automatiques.
  enforceRateLimit(event, `like:${ip}:${identifier}`, 6, HOUR)
  enforceRateLimit(event, `like:ip:${ip}`, 60, HOUR)

  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites/${encodeURIComponent(identifier)}/like`,
    { method: 'DELETE', headers: strapiHeaders() },
  )

  return response?.data ?? response
})
