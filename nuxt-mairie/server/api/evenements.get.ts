// server/api/evenements.get.ts — Événements à venir depuis Strapi 5
import { strapiHeaders, transformEvenement } from '~/server/utils/strapi'

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  try {
    const params = new URLSearchParams()
    // Tous les événements publiés sont affichés, y compris ceux dont la date est passée.
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
}, {
  // Mise en cache courte de la réponse.
  // ⚠️ `getKey` inclut la query string : par défaut Nitro ne garde que le chemin,
  // si bien que /api/evenements?a=1 et /api/evenements?a=2 partageaient la même entrée de
  // cache et renvoyaient le même contenu.
  maxAge: 120,
  swr: true,
  getKey: event => event.path,
  // En développement, pas de cache : un contenu modifié dans Strapi apparaît
  // immédiatement au rechargement de la page.
  shouldBypassCache: () => import.meta.dev,
})
