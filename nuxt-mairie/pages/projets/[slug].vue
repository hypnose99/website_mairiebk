<script setup lang="ts">
import type { Project } from '~/types'

const route = useRoute()
const { data: projects, pending: projectPending } = await useLazyFetch<Project[]>('/api/projects', {
  query: { slug: route.params.slug, detail: true, perPage: 1 },
  key: `project-${route.params.slug}`,
})

const projet = computed(() => projects.value?.[0] ?? null)

useSeoMeta({
  title: () => projet.value?.title ?? 'Projet municipal',
  description: () => projet.value?.resume ?? projet.value?.description ?? 'Projet municipal de la ville de Bouaké.',
})

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''
</script>

<template>
  <main v-if="projet" class="project-detail">
    <header class="project-hero">
      <div v-if="projet.coverImage" class="project-hero__media">
        <img :src="projet.coverImage" :alt="projet.title" class="project-hero__image" />
      </div>
      <div v-else class="project-hero__media project-hero__media--empty">Image à venir</div>
      <div class="project-hero__content">
        <NuxtLink to="/projets" class="project-back">← Tous les projets</NuxtLink>
        <p class="project-kicker">Projet municipal · {{ projet.category || 'Bouaké' }}</p>
        <h1>{{ projet.title }}</h1>
        <p v-if="projet.resume" class="project-resume">{{ projet.resume }}</p>
      </div>
    </header>

    <div class="project-detail__body">
      <aside class="project-meta">
        <div v-if="projet.status"><strong>Statut</strong><span>{{ projet.status.replace('_', ' ') }}</span></div>
        <div v-if="projet.dateDebut"><strong>Début</strong><span>{{ formatDate(projet.dateDebut) }}</span></div>
        <div v-if="projet.dateFin"><strong>Fin prévue</strong><span>{{ formatDate(projet.dateFin) }}</span></div>
        <div v-if="projet.maitreOuvrage"><strong>Maître d'ouvrage</strong><span>{{ projet.maitreOuvrage }}</span></div>
        <div v-if="projet.bailleurs || projet.financement"><strong>Bailleur(s)</strong><span>{{ projet.bailleurs || projet.financement }}</span></div>
      </aside>

      <section class="project-content">
        <h2>Présentation du projet</h2>
        <p v-if="projet.content || projet.description">{{ projet.content || projet.description }}</p>

        <div v-if="projet.images && projet.images.length > 0" class="project-gallery">
          <h2>Galerie du projet</h2>
          <div class="project-gallery__grid">
            <img v-for="image in projet.images" :key="image.src" :src="image.src" :alt="image.alt || projet.title" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  </main>

  <main v-else-if="projectPending" class="project-loading" role="status" aria-live="polite">
    <div class="loading-skeleton loading-skeleton--hero" />
    <div class="loading-skeleton loading-skeleton--line" />
    <div class="loading-skeleton loading-skeleton--line loading-skeleton--short" />
  </main>

  <main v-else class="project-not-found">
    <h1>Projet introuvable</h1>
    <NuxtLink to="/projets">Retour aux projets</NuxtLink>
  </main>
</template>

<style scoped>
.project-detail { background: #F7F6F2; color: #12140F; }
.project-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; min-height: 440px; background: white; }
.project-hero__media { min-height: 440px; overflow: hidden; background: #E9E7E0; }
.project-hero__media--empty { display: grid; place-items: center; color: #777; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; }
.project-hero__image { width: 100%; height: 100%; object-fit: cover; display: block; }
.project-hero__content { display: flex; flex-direction: column; justify-content: center; padding: 56px clamp(28px, 6vw, 88px); border-top: 4px solid #F77F00; }
.project-back { color: #009640; font-size: 0.78rem; font-weight: 700; text-decoration: none; margin-bottom: 48px; }
.project-kicker { color: #E65100; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
h1 { max-width: 620px; margin: 10px 0 20px; font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1.02; text-transform: uppercase; }
.project-resume { max-width: 580px; color: #555; line-height: 1.7; }
.project-detail__body { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 64px; max-width: 1200px; margin: 0 auto; padding: 72px 32px; }
.project-meta { align-self: start; border-top: 3px solid #009640; background: white; }
.project-meta div { display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border-bottom: 1px solid #EBEBEB; }
.project-meta strong { color: #777; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; }
.project-meta span { font-size: 0.9rem; font-weight: 700; }
.project-content { max-width: 760px; }
.project-content h2 { margin: 0 0 18px; font-size: 1.35rem; text-transform: uppercase; }
.project-content p { color: #555; line-height: 1.8; white-space: pre-line; }
.project-gallery { margin-top: 56px; }
.project-gallery__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.project-gallery__grid img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
.project-not-found { padding: 120px 24px; text-align: center; }
.project-loading { padding: 48px 24px; max-width: 1100px; margin: auto; }
.loading-skeleton { background: linear-gradient(90deg, #E9E7E0 25%, #F7F6F2 50%, #E9E7E0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.2s infinite; }
.loading-skeleton--hero { height: 360px; margin-bottom: 28px; }
.loading-skeleton--line { height: 20px; margin: 14px 0; }
.loading-skeleton--short { width: 60%; }
@keyframes skeleton-shimmer { to { background-position: -200% 0; } }
.project-not-found a { color: #009640; }
@media (max-width: 760px) {
  .project-hero { grid-template-columns: 1fr; }
  .project-hero__media { min-height: 280px; }
  .project-hero__content { padding: 36px 24px 48px; }
  .project-back { margin-bottom: 28px; }
  .project-detail__body { grid-template-columns: 1fr; gap: 36px; padding: 48px 20px; }
  .project-gallery__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
