// composables/useElus.ts — Accès aux données des élus municipaux
import type { Maire, Adjoint } from '~/types'

export const useElus = () => {
  // useFetch est SSR-aware : exécuté serveur + hydraté côté client
  const {
    data: elus,
    pending,
    error,
    refresh,
  } = useFetch<{ maire: Maire; adjoints: Adjoint[] }>('/api/elus', {
    key: 'elus',
    default: () => ({ maire: null, adjoints: [] }),
  })

  const maire = computed(() => elus.value?.maire ?? null)
  const adjoints = computed(() => elus.value?.adjoints ?? [])

  const getAdjointByRank = (rank: number) =>
    adjoints.value.find(a => a.rank === rank)

  return {
    maire,
    adjoints,
    pending,
    error,
    refresh,
    getAdjointByRank,
  }
}
