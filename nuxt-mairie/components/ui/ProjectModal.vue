<script setup lang="ts">
// components/ui/ProjectModal.vue — Grand popup détail projet
import type { Project } from '~/types'

const props = defineProps<{ project: Project | null; pending?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const isOpen = computed(() => props.project !== null)

// ── Galerie ──────────────────────────────────────────────────────────────────
const PLACEHOLDER = {
  src: 'https://placehold.co/1400x800/0D3B22/FFFFFF?text=Photo+%C3%A0+venir',
  alt: 'Photo à venir',
  caption: '',
}
const images = computed(() =>
  props.project?.images?.length ? props.project.images : [PLACEHOLDER],
)
const activeIndex = ref(0)
const activeImage = computed(() => images.value[activeIndex.value] ?? images.value[0])

watch(() => props.project, () => { activeIndex.value = 0 })

// ── Statut & catégorie ───────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours', color: '#E65100' },
  termine:  { label: 'Terminé',  color: '#009640' },
  planifie: { label: 'Planifié', color: '#1565C0' },
  suspendu: { label: 'Suspendu', color: '#757575' },
}
const status = computed(() => STATUS[props.project?.status ?? ''] ?? STATUS.en_cours)

const CATEGORIES: Record<string, string> = {
  infrastructure: 'Infrastructure',
  sante:          'Santé',
  economie:       'Économie',
  education:      'Éducation',
  social:         'Social & Logement',
  environnement:  'Environnement',
}
const categoryLabel = computed(() =>
  CATEGORIES[props.project?.category ?? ''] ?? props.project?.category ?? '',
)

// ── Contenu long : HTML ou texte brut → paragraphes ──────────────────────────
// On affiche le contenu détaillé ; si vide, repli sur le résumé pour éviter une section vide
const contentBlocks = computed(() => {
  const c = (props.project?.content?.trim() || props.project?.description?.trim()) ?? ''
  if (!c) return []
  if (c.includes('<')) return [{ html: true, text: c }]
  return c.split(/\n{1,}/).filter(Boolean).map(text => ({ html: false, text }))
})

// Date "2025-03-01" → "mars 2025"
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

// ── Fiche technique ──────────────────────────────────────────────────────────
const metaItems = computed(() => [
  { icon: 'fa-solid fa-layer-group',         label: 'Catégorie',         value: categoryLabel.value },
  { icon: 'fa-solid fa-coins',               label: 'Budget',            value: props.project?.budget },
  { icon: 'fa-solid fa-landmark',            label: 'Maître d\'ouvrage',  value: props.project?.maitreOuvrage },
  { icon: 'fa-solid fa-hand-holding-dollar', label: 'Bailleur(s)',        value: props.project?.bailleurs ?? props.project?.financement },
  { icon: 'fa-solid fa-helmet-safety',       label: 'Entreprises',       value: props.project?.entreprises },
  { icon: 'fa-solid fa-calendar-day',        label: 'Début des travaux', value: fmtDate(props.project?.dateDebut) },
  { icon: 'fa-solid fa-flag-checkered',      label: 'Fin prévue',        value: fmtDate(props.project?.dateFin) },
  { icon: 'fa-solid fa-calendar-check',      label: 'Livraison prévue',  value: props.project?.livraisonPrevue },
].filter(m => m.value))

// ── Progression animée à l'ouverture ─────────────────────────────────────────
const progressShown = ref(false)
watch(isOpen, (open) => {
  progressShown.value = false
  if (open) setTimeout(() => { progressShown.value = true }, 350)
})

// ── Scroll lock + Échap ──────────────────────────────────────────────────────
watch(isOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="pm">
      <div v-if="project" class="pm-backdrop" @click.self="emit('close')">
        <div class="pm-panel" role="dialog" aria-modal="true" :aria-label="project.title">

          <!-- Fermer -->
          <button class="pm-close" aria-label="Fermer" @click="emit('close')">
            <i class="fa-solid fa-xmark" />
          </button>

          <!-- ░░ HERO ░░ -->
          <div class="pm-hero">
            <Transition name="pm-img" mode="out-in">
              <img
                :key="activeImage.src"
                :src="activeImage.src"
                :alt="activeImage.alt"
                class="pm-hero__img"
              />
            </Transition>
            <div class="pm-hero__overlay" />

            <div class="pm-hero__content">
              <div class="pm-hero__badges pm-anim" style="--d: 0.1s">
                <span class="pm-badge" :style="{ background: status.color }">
                  <span class="pm-badge__dot" /> {{ status.label }}
                </span>
                <span v-if="categoryLabel" class="pm-badge pm-badge--ghost">{{ categoryLabel }}</span>
              </div>
              <h2 class="pm-hero__title pm-anim" style="--d: 0.18s">{{ project.title }}</h2>
              <div v-if="project.budget" class="pm-hero__budget pm-anim" style="--d: 0.26s">
                <i class="fa-solid fa-coins" /> {{ project.budget }}
              </div>
              <div v-if="pending" class="pm-loading-badge pm-anim" style="--d: 0.3s">
                <span class="pm-loading-badge__dot" /> Chargement de la fiche complète…
              </div>
            </div>

            <!-- Miniatures dans le hero -->
            <div v-if="images.length > 1" class="pm-hero__thumbs pm-anim" style="--d: 0.34s">
              <button
                v-for="(img, i) in images"
                :key="img.src"
                class="pm-thumb"
                :class="{ 'pm-thumb--active': i === activeIndex }"
                :aria-label="`Photo ${i + 1}`"
                @click="activeIndex = i"
              >
                <img :src="img.src" :alt="img.alt" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- ░░ CORPS ░░ -->
          <div class="pm-body">

            <div class="pm-main">
              <!-- Avancement -->
              <div class="pm-progress pm-anim" style="--d: 0.3s">
                <div class="pm-progress__head">
                  <span class="pm-progress__label">Niveau d'exécution global</span>
                  <span class="pm-progress__pct" :style="{ color: status.color }">
                    {{ project.progressPercent }}%
                  </span>
                </div>
                <div class="pm-progress__track">
                  <div
                    class="pm-progress__bar"
                    :style="{ width: progressShown ? `${project.progressPercent}%` : '0%' }"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="pm-section pm-anim" style="--d: 0.38s">
                <h3 class="pm-section__title">
                  <span class="pm-section__accent" :style="{ background: status.color }" />
                  Le projet
                </h3>

                <template v-if="contentBlocks.length">
                  <template v-for="(block, i) in contentBlocks" :key="i">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div v-if="block.html" class="pm-content" v-html="block.text" />
                    <p v-else class="pm-content">{{ block.text }}</p>
                  </template>
                </template>
              </div>

              <!-- Tags -->
              <div v-if="project.tags?.length" class="pm-tags pm-anim" style="--d: 0.46s">
                <span v-for="tag in project.tags" :key="tag" class="pm-tag">#{{ tag }}</span>
              </div>
            </div>

            <!-- Fiche technique -->
            <aside v-if="metaItems.length" class="pm-side pm-anim" style="--d: 0.42s">
              <h3 class="pm-side__title">Fiche technique</h3>
              <div class="pm-meta">
                <div v-for="m in metaItems" :key="m.label" class="pm-meta__item">
                  <span class="pm-meta__label"><i :class="m.icon" /> {{ m.label }}</span>
                  <strong class="pm-meta__value">{{ m.value }}</strong>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ─── Backdrop ───────────────────────────────────────────────── */
.pm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(8, 14, 10, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}

/* ─── Panneau ────────────────────────────────────────────────── */
.pm-panel {
  position: relative;
  width: min(1080px, 100%);
  max-height: 92vh;
  background: white;
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.45);
}

/* ─── Transitions d'ouverture ────────────────────────────────── */
.pm-enter-active { transition: opacity 0.35s ease; }
.pm-leave-active { transition: opacity 0.25s ease; }
.pm-enter-from, .pm-leave-to { opacity: 0; }

.pm-enter-active .pm-panel {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}
.pm-leave-active .pm-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.pm-enter-from .pm-panel { transform: translateY(48px) scale(0.965); opacity: 0; }
.pm-leave-to   .pm-panel { transform: translateY(24px) scale(0.98);  opacity: 0; }

/* Apparition en cascade des sections */
.pm-anim {
  animation: pmFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0s);
}
@keyframes pmFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Fermer ─────────────────────────────────────────────────── */
.pm-close {
  position: absolute;
  top: 16px; right: 16px;
  z-index: 10;
  width: 42px; height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
  color: white;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.25s;
}
.pm-close:hover { background: #E65100; transform: rotate(90deg); }

/* ─── Hero ───────────────────────────────────────────────────── */
.pm-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
  background: #0A2E1A;
}
.pm-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pm-img-enter-active, .pm-img-leave-active { transition: opacity 0.3s ease, transform 0.7s ease; }
.pm-img-enter-from { opacity: 0; transform: scale(1.04); }
.pm-img-leave-to   { opacity: 0; }

.pm-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(4, 12, 7, 0.88) 0%, rgba(4, 12, 7, 0.25) 55%, rgba(4, 12, 7, 0.15) 100%);
}
.pm-hero__content {
  position: absolute;
  left: 40px; right: 40px; bottom: 76px;
  z-index: 2;
}
.pm-hero__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.pm-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: white;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 6px 14px;
}
.pm-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: white;
  animation: pmPulse 1.6s infinite;
}
@keyframes pmPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}
.pm-badge--ghost {
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(4px);
}
.pm-hero__title {
  font-size: clamp(1.5rem, 3vw, 2.3rem);
  font-weight: 900;
  color: white;
  line-height: 1.12;
  margin: 0 0 12px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
  max-width: 720px;
}
.pm-hero__budget {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #F5A623;
  font-size: 0.95rem;
  font-weight: 800;
}
.pm-loading-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
}
.pm-loading-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #F5A623;
  animation: pmPulse 1.2s infinite;
}

/* Miniatures */
.pm-hero__thumbs {
  position: absolute;
  left: 40px; right: 40px; bottom: 16px;
  z-index: 3;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.pm-thumb {
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.35);
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  opacity: 0.72;
  transition: all 0.25s;
}
.pm-thumb img {
  width: 66px; height: 44px;
  object-fit: cover;
  display: block;
}
.pm-thumb:hover { opacity: 1; transform: translateY(-2px); }
.pm-thumb--active {
  border-color: #F5A623;
  opacity: 1;
}

/* ─── Corps ──────────────────────────────────────────────────── */
.pm-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 44px;
  padding: 36px 40px 48px;
}
.pm-main { min-width: 0; }

/* Avancement */
.pm-progress { margin-bottom: 32px; }
.pm-progress__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.pm-progress__label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #444;
}
.pm-progress__pct { font-size: 1.4rem; font-weight: 900; }
.pm-progress__track {
  height: 10px;
  background: #EEE;
  border-radius: 20px;
  overflow: hidden;
}
.pm-progress__bar {
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(90deg, var(--primary-green, #009640), var(--primary-orange, #E65100));
  transition: width 1.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Sections */
.pm-section { margin-bottom: 28px; }
.pm-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #111;
  margin: 0 0 16px;
}
.pm-section__accent {
  width: 4px; height: 18px;
  flex-shrink: 0;
}
.pm-content {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.85;
  margin: 0 0 14px;
}
.pm-content :deep(h2), .pm-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 800;
  color: #111;
  margin: 24px 0 10px;
}
.pm-content :deep(img) { width: 100%; margin: 14px 0; }

/* Tags */
.pm-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.pm-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #666;
  background: #F2F2F0;
  padding: 4px 12px;
}

/* ─── Fiche technique ────────────────────────────────────────── */
.pm-side { min-width: 0; }
.pm-side__title {
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #999;
  margin: 0 0 14px;
}
.pm-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #EBEBEB;
  border: 1px solid #EBEBEB;
  border-left: 3px solid #E65100;
}
.pm-meta__item {
  background: #FAFAF8;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pm-meta__label {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pm-meta__label i { color: #009640; font-size: 0.65rem; }
.pm-meta__value {
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 700;
}

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 860px) {
  .pm-backdrop { padding: 0; }
  .pm-panel { max-height: 100vh; height: 100%; width: 100%; }
  .pm-hero { height: 300px; }
  .pm-hero__content { left: 20px; right: 20px; bottom: 66px; }
  .pm-hero__thumbs { left: 20px; right: 20px; }
  .pm-body {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 24px 20px 40px;
  }
}
</style>
