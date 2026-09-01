// composables/useProjects.ts — Accès aux projets municipaux
import type { Project, ProjectStatus } from '~/types'

export const useProjects = () => {
  const { data: projects, pending, error } = useFetch<Project[]>('/api/projects', {
    key: 'projects',
    default: () => [],
  })

  const filterByStatus = (status: ProjectStatus) =>
    computed(() => projects.value?.filter(p => p.status === status) ?? [])

  const getBySlug = (slug: string) =>
    computed(() => projects.value?.find(p => p.slug === slug) ?? null)

  const enCours = filterByStatus('en_cours')
  const termines = filterByStatus('termine')
  const planifies = filterByStatus('planifie')

  return {
    projects,
    enCours,
    termines,
    planifies,
    pending,
    error,
    getBySlug,
  }
}
