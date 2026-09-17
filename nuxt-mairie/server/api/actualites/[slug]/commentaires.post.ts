// server/api/actualites/[slug]/commentaires.post.ts — Envoi d'un commentaire (modéré)
//
// Le commentaire est créé en brouillon dans Strapi : il n'apparaît sur le site
// qu'après validation (publication) par la mairie dans l'admin Strapi.
import { strapiHeaders } from '~/server/utils/strapi'
import { clientIp, enforceRateLimit } from '~/server/utils/rate-limit'

const MINUTE = 60 * 1000

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const identifier = getRouterParam(event, 'slug')
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  const body = await readBody<{ name?: string; text?: string; website?: string }>(event)

  // Piège à robots : champ invisible pour un humain. S'il est rempli, on fait
  // comme si tout s'était bien passé, sans rien enregistrer.
  if (body?.website) return { ok: true, moderation: true }

  const name = String(body?.name ?? '').replace(/\s+/g, ' ').trim()
  const text = String(body?.text ?? '').trim()
  if (name.length < 2 || name.length > 60) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom doit contenir entre 2 et 60 caractères.' })
  }
  if (text.length < 3 || text.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Le commentaire doit contenir entre 3 et 1000 caractères.' })
  }

  // Anti-spam : 3 commentaires par tranche de 10 minutes, 15 par jour, par visiteur
  const ip = clientIp(event)
  enforceRateLimit(event, `comment:10m:${ip}`, 3, 10 * MINUTE)
  enforceRateLimit(event, `comment:day:${ip}`, 15, 24 * 60 * MINUTE)

  // L'identifiant reçu peut être un slug : on retrouve le documentId de l'article
  const lookup = new URLSearchParams({
    'filters[$or][0][documentId][$eq]': identifier,
    'filters[$or][1][slug][$eq]': identifier,
    'fields[0]': 'title',
    'pagination[limit]': '1',
  })
  const found = await $fetch<any>(
    `${config.strapiUrl}/api/actualites?${lookup}`,
    { headers: strapiHeaders() },
  )
  const articleId = found?.data?.[0]?.documentId
  if (!articleId) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  try {
    await $fetch(`${config.strapiUrl}/api/commentaires`, {
      method: 'POST',
      headers: strapiHeaders(),
      body: { data: { nom: name, texte: text, actualite: articleId } },
    })
  }
  catch (err: any) {
    console.error('[api/commentaires] Strapi error:', err?.statusCode ?? err?.message)
    throw createError({ statusCode: 502, statusMessage: "Le commentaire n'a pas pu être envoyé. Réessayez plus tard." })
  }

  return { ok: true, moderation: true }
})
