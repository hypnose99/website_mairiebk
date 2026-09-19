// server/api/categories-actualites.get.ts — Catégories d'actualités depuis Strapi 5
import { strapiHeaders } from '~/server/utils/strapi'

export default defineCachedEventHandler(async (event) => {
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
}, {
  // Mise en cache courte de la réponse.
  // ⚠️ `getKey` inclut la query string : par défaut Nitro ne garde que le chemin,
  // si bien que /api/categories-actualites?a=1 et /api/categories-actualites?a=2 partageaient la même entrée de
  // cache et renvoyaient le même contenu.
  maxAge: 900,
  swr: true,
  getKey: event => event.path,
  // En développement, pas de cache : un contenu modifié dans Strapi apparaît
  // immédiatement au rechargement de la page.
  shouldBypassCache: () => import.meta.dev,
})
