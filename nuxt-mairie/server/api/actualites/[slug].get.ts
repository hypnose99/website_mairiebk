// server/api/actualites/[slug].get.ts — Article par slug (ou documentId) depuis Strapi 5
import { actualiteSlug, slugify, strapiFetchRange, strapiHeaders, transformActualite } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug   = getRouterParam(event, 'slug')

  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  const populate = new URLSearchParams()
  populate.append('populate[coverImage]', 'true')
  populate.append('populate[categorie]', 'true')
  populate.append('populate[gallery]', 'true')

  // 1) Cas normal : le slug Strapi
  const bySlug = new URLSearchParams(populate)
  bySlug.append('filters[slug][$eq]', slug)
  bySlug.append('pagination[limit]', '1')
  const response = await $fetch<any>(
    `${config.strapiUrl}/api/actualites?${bySlug}`,
    { headers: strapiHeaders() },
  )
  let item = response?.data?.[0]

  // 2) Lien construit avec le documentId
  if (!item && /^[a-z0-9]{20,}$/i.test(slug)) {
    const byId = new URLSearchParams(populate)
    byId.append('filters[documentId][$eq]', slug)
    byId.append('pagination[limit]', '1')
    const res = await $fetch<any>(
      `${config.strapiUrl}/api/actualites?${byId}`,
      { headers: strapiHeaders() },
    )
    item = res?.data?.[0]
  }

  // 3) Anciens liens calculés depuis le titre (articles sans slug ou titre modifié).
  //    On parcourt toutes les pages (titre + slug uniquement, réponse légère),
  //    puis on recharge l'article trouvé avec ses médias.
  if (!item) {
    const light = new URLSearchParams()
    light.append('fields[0]', 'title')
    light.append('fields[1]', 'slug')
    const { items } = await strapiFetchRange('actualites', light, { start: 0, limit: 5000 })
    const match = items.find((candidate: any) =>
      actualiteSlug(candidate) === slug || slugify(candidate.title) === slug,
    )
    if (match) {
      const byId = new URLSearchParams(populate)
      byId.append('filters[documentId][$eq]', match.documentId)
      byId.append('pagination[limit]', '1')
      const res = await $fetch<any>(
        `${config.strapiUrl}/api/actualites?${byId}`,
        { headers: strapiHeaders() },
      )
      item = res?.data?.[0]
    }
  }

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  return transformActualite(item, config.strapiUrl)
})
