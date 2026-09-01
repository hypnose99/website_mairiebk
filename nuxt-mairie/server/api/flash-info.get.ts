// server/api/flash-info.get.ts — Flash infos actifs depuis Strapi 5
import { strapiHeaders, transformFlashInfo } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
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
})
