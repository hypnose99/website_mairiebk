// server/api/evenements.get.ts — Événements à venir depuis Strapi 5
import { strapiHeaders, transformEvenement } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  try {
    const params = new URLSearchParams()
    params.append('sort[0]', 'dateDebut:asc')
    params.append('pagination[pageSize]', String(Number(query.perPage) || 6))
    params.append('populate', 'image')

    const response = await $fetch<any>(
      `${config.strapiUrl}/api/evenements?${params}`,
      { headers: strapiHeaders() }
    )

    return (response.data ?? []).map((item: any) =>
      transformEvenement(item, config.strapiUrl)
    )
  }
  catch (err: any) {
    // Ne jamais faire tomber la page : on log et on renvoie une liste vide
    console.error('[api/evenements] Strapi error:', err?.statusCode ?? err?.message)
    return []
  }
})
