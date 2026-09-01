// composables/useActualites.ts — Accès aux actualités municipales
import type { Actualite, ActualiteCategory } from '~/types'

interface ActualitesFilters {
  category?: ActualiteCategory
  year?: number
  month?: number
  search?: string
  page?: number
  perPage?: number
}

export const useActualites = (filters?: Ref<ActualitesFilters> | ActualitesFilters) => {
  const resolvedFilters = isRef(filters) ? filters : ref(filters ?? {})

  // Paramètres réactifs pour la requête
  const queryParams = computed(() => ({
    ...resolvedFilters.value,
    page: resolvedFilters.value.page ?? 1,
    perPage: resolvedFilters.value.perPage ?? 9,
  }))

  const { data, pending, error, refresh } = useFetch<{
    items: Actualite[]
    total: number
    page: number
    perPage: number
  }>('/api/actualites', {
    key: computed(() => `actualites-${JSON.stringify(queryParams.value)}`),
    query: queryParams,
    default: () => ({ items: [], total: 0, page: 1, perPage: 9 }),
    watch: [queryParams],
  })

  const actualites = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const totalPages = computed(() =>
    Math.ceil(total.value / (queryParams.value.perPage ?? 9))
  )
  const featured = computed(() => actualites.value.filter(a => a.featured))

  // Récupère un article par slug (appel séparé)
  const getBySlug = async (slug: string): Promise<Actualite | null> => {
    const { data } = await useFetch<Actualite>(`/api/actualites/${slug}`)
    return data.value ?? null
  }

  return {
    actualites,
    total,
    totalPages,
    featured,
    pending,
    error,
    refresh,
    getBySlug,
  }
}
