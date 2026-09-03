<script setup lang="ts">
// pages/projets.vue — Grands projets municipaux (design institutionnel)
import type { Project } from '~/types'

const { projects, pending } = useProjects()

useSeoMeta({
  title: 'Les Grands Projets',
  description: 'Suivez l\'avancement des grands chantiers qui transforment Bouaké au quotidien.',
})

// ── Filtres par statut ───────────────────────────────────────────────────────
const FILTERS = [
  { value: '',         label: 'Tous les projets' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'planifie', label: 'Planifiés' },
  { value: 'termine',  label: 'Terminés' },
]
const selStatus = ref('')

const filtered = computed<Project[]>(() => {
  const list = projects.value ?? []
  return selStatus.value ? list.filter(p => p.status === selStatus.value) : list
})

// ── Statistiques du bandeau ──────────────────────────────────────────────────
const stats = computed(() => {
  const list = projects.value ?? []
  const enCours = list.filter(p => p.status === 'en_cours').length
  const avg = list.length
    ? Math.round(list.reduce((s, p) => s + p.progressPercent, 0) / list.length)
    : 0
  return { total: list.length, enCours, avg }
})

// ── Popup détail ─────────────────────────────────────────────────────────────
// Ouverture immédiate avec les données déjà connues (liste), puis enrichissement
// (galerie complète) en arrière-plan : le popup n'attend plus la requête Strapi.
const selectedProject = ref<Project | null>(null)
const projectDetailPending = ref(false)
const openProject = async (p: Project) => {
  selectedProject.value = p
  projectDetailPending.value = true
  try {
    const detail = await $fetch<Project[]>('/api/projects', {
      query: { slug: p.slug, detail: true, perPage: 1 },
    })
    if (selectedProject.value?.slug === p.slug) {
      selectedProject.value = detail[0] ?? p
    }
  }
  finally {
    projectDetailPending.value = false
  }
}
const closeProject = () => { selectedProject.value = null }
</script>

<template>
  <div class="projets-page">

    <!-- ░░ BANDEAU ÉDITORIAL — VARIANTE CHANTIER ░░ -->
    <section class="phero">
      <div class="phero__flagline" aria-hidden="true" />
      <div class="phero__blueprint" aria-hidden="true" />
      <div class="phero__inner">

        <div class="phero__text">
          <p class="phero__overline">
            <span class="flag-chip" aria-hidden="true">
              <i class="fc fc--orange" /><i class="fc fc--white" /><i class="fc fc--green" />
            </span>
            Investissements publics · Commune de Bouaké
          </p>
          <h1 class="phero__title">Les grands<br /><span class="t-orange">projets</span></h1>
          <p class="phero__subtitle">
            Suivez en toute transparence l'évolution des chantiers qui transforment
            Bouaké au quotidien : financement, entreprises, délais et niveau d'exécution.
          </p>
        </div>

        <!-- Tableau de bord chantier -->
        <aside class="phero__board">
          <p class="phero__board-head">
            <i class="fa-solid fa-helmet-safety" /> Tableau de bord
          </p>
          <div class="phero__board-row">
            <span class="phero__board-num">{{ stats.total }}</span>
            <span class="phero__board-label">Projets suivis</span>
          </div>
          <div class="phero__board-row">
            <span class="phero__board-num phero__board-num--orange">{{ stats.enCours }}</span>
            <span class="phero__board-label">Chantiers en cours</span>
          </div>
          <div class="phero__board-row">
            <span class="phero__board-num phero__board-num--green">{{ stats.avg }}<small>%</small></span>
            <span class="phero__board-label">Avancement moyen</span>
          </div>
        </aside>

      </div>
    </section>

    <!-- ░░ FILTRES ░░ -->
    <div class="pfilters-wrap">
      <div class="pfilters">
        <button
          v-for="f in FILTERS"
          :key="f.value"
          class="pfilter"
          :class="{ 'pfilter--active': selStatus === f.value }"
          @click="selStatus = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- ░░ LISTE DES PROJETS ░░ -->
    <div class="plist">

      <div v-if="pending" class="ploading">
        <div class="pspinner" />
      </div>

      <template v-else>
        <div v-if="filtered.length === 0" class="pempty">
          <i class="fa-solid fa-helmet-safety" />
          <p>Aucun projet ne correspond à ce filtre.</p>
          <button class="pempty__reset" @click="selStatus = ''">Voir tous les projets</button>
        </div>

        <UiProjectCard
          v-for="(project, i) in filtered"
          :key="project.id"
          :project="project"
          :index="i"
          :reversed="i % 2 === 1"
          class="plist__item"
          @open="openProject(project)"
        />
      </template>

    </div>

    <!-- ░░ POPUP DÉTAIL ░░ -->
    <UiProjectModal :project="selectedProject" :pending="projectDetailPending" @close="closeProject" />
  </div>
</template>

<style scoped>
/* ─── Bandeau éditorial (variante chantier) ──────────────────── */
.phero {
  position: relative;
  background: #F7F6F2;
  color: #12140F;
  overflow: hidden;
  border-bottom: 1px solid #E9E7E0;
}
/* Liseré drapeau ivoirien */
.phero__flagline {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(
    to right,
    #F77F00 0 33.34%,
    #FFFFFF 33.34% 66.67%,
    #009640 66.67% 100%
  );
  z-index: 1;
}
/* Grille "plan d'architecte" en filigrane, côté droit */
.phero__blueprint {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(18, 20, 15, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 20, 15, 0.05) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(to left, black 0%, transparent 55%);
}
.phero__inner {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 64px 48px 56px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: center;
}

/* Texte */
.phero__overline {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #74736A;
  margin-bottom: 20px;
}
.flag-chip { display: inline-flex; gap: 2px; flex-shrink: 0; }
.fc { display: block; width: 8px; height: 13px; }
.fc--orange { background: #F77F00; }
.fc--white  { background: #FFF; border: 1px solid #DDDBD2; }
.fc--green  { background: #009640; }

.phero__title {
  font-size: clamp(2.4rem, 5.5vw, 4.4rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.94;
  letter-spacing: -0.02em;
  color: #12140F;
  margin: 0 0 18px;
}
.phero__title .t-orange { color: #E65100; }
.phero__subtitle {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #5C5B51;
  max-width: 540px;
  margin: 0;
}

/* Tableau de bord chantier */
.phero__board {
  justify-self: end;
  width: min(340px, 100%);
  background: white;
  border: 1px solid #E7E4DB;
  outline: 1px solid #E7E4DB;
  outline-offset: 5px;
  border-left: 4px solid #E65100;
  box-shadow: 0 24px 60px rgba(30, 30, 20, 0.10);
  padding: 22px 26px 10px;
}
.phero__board-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #8E8D82;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EFEDE6;
}
.phero__board-head i { color: #E65100; font-size: 0.85rem; }
.phero__board-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #EFEDE6;
}
.phero__board-row:last-child { border-bottom: none; }
.phero__board-num {
  font-size: 1.9rem;
  font-weight: 900;
  line-height: 1;
  color: #12140F;
}
.phero__board-num small { font-size: 1.1rem; font-weight: 800; }
.phero__board-num--orange { color: #E65100; }
.phero__board-num--green  { color: #009640; }
.phero__board-label {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8E8D82;
  text-align: right;
}

/* ─── Filtres ────────────────────────────────────────────────── */
.pfilters-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-bottom: 1px solid #EBEBEB;
}
.pfilters {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.pfilter {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 18px 20px 15px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #777;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;
}
.pfilter:hover { color: #009640; }
.pfilter--active {
  color: #009640;
  border-bottom-color: #009640;
}

/* ─── Liste ──────────────────────────────────────────────────── */
.plist {
  max-width: 1400px;
  margin: 0 auto;
  padding: 56px 48px 96px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

/* ─── États ──────────────────────────────────────────────────── */
.ploading { display: flex; justify-content: center; padding: 80px 0; }
.pspinner {
  width: 40px; height: 40px;
  border: 3px solid #EEE;
  border-top-color: #009640;
  border-radius: 50%;
  animation: pspin 0.8s linear infinite;
}
@keyframes pspin { to { transform: rotate(360deg); } }

.pempty { text-align: center; padding: 60px 20px; color: #BBB; }
.pempty i { font-size: 3rem; margin-bottom: 16px; display: block; }
.pempty p { font-size: 1rem; color: #999; margin-bottom: 20px; }
.pempty__reset {
  background: none;
  border: 1.5px solid #CCC;
  padding: 10px 28px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.pempty__reset:hover { border-color: #009640; color: #009640; }

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 992px) {
  .phero__inner { grid-template-columns: 1fr; gap: 32px; }
  .phero__board { justify-self: start; }
}
@media (max-width: 768px) {
  .phero__inner { padding: 48px 20px 40px; }
  .pfilters { padding: 0 20px; }
  .plist { padding: 36px 20px 72px; gap: 40px; }
}
</style>
