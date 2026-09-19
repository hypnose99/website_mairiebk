// server/api/flash-info.get.ts — Flash infos actifs depuis Strapi 5
import { strapiHeaders, transformFlashInfo } from '~/server/utils/strapi'

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const params = new URLSearchParams()
    params.append('filters[actif][$eq]', 'true')
    params.append('sort[0]',             'publishedAt:desc')
    params.append('pagination[pageSize]','5')

    const response = await $fetch<any>(
      `${config.strapiUrl}/api/flash-infos?${params}`,
      { headers: strapiHeaders() }
    )

    return (response.data ?? []).map(transformFlashInfo)
  }
  catch (err: any) {
    console.error('[api/flash-info] Strapi error:', err?.statusCode ?? err?.message)
    return []
  }
}, {
  // Mise en cache courte de la réponse.
  // ⚠️ `getKey` inclut la query string : par défaut Nitro ne garde que le chemin,
  // si bien que /api/flash-info?a=1 et /api/flash-info?a=2 partageaient la même entrée de
  // cache et renvoyaient le même contenu.
  maxAge: 300,
  swr: true,
  getKey: event => event.path,
  // En développement, pas de cache : un contenu modifié dans Strapi apparaît
  // immédiatement au rechargement de la page.
  shouldBypassCache: () => import.meta.dev,
})
