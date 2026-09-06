// server/api/categories-actualites.get.ts — Catégories d'actualités depuis Strapi 5
import { strapiHeaders } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const params = new URLSearchParams()
    params.append('sort[0]', 'nom:asc')
    params.append('pagination[pageSize]', '100')

    const response = await $fetch<any>(
      `${config.strapiUrl}/api/categorie-actualites?${params}`,
      { headers: strapiHeaders() }
    )

    return (response.data ?? []).map((item: any) => ({
      value:  item.slug,
      label:  item.nom,
      accent: item.couleur,
    }))
  }
  catch (err: any) {
    console.error('[api/categories-actualites] Strapi error:', err?.statusCode ?? err?.message)
    return []
  }
})
