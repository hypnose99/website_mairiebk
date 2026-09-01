<script setup lang="ts">
// components/ui/ProjectCard.vue — Carte projet institutionnelle premium
import type { Project } from '~/types'

const props = defineProps<{
  project: Project
  index?: number
  reversed?: boolean
}>()

const emit = defineEmits<{ open: [] }>()

const PLACEHOLDER = {
  src: 'https://placehold.co/1000x700/0D3B22/FFFFFF?text=Photo+%C3%A0+venir',
  alt: 'Photo à venir',
  caption: 'Photo à venir',
}

const images = computed(() =>
  props.project.images?.length ? props.project.images : [PLACEHOLDER],
)

const activeImageIndex = ref(0)
const activeImage = computed(() =>
  images.value[activeImageIndex.value] ?? images.value[0],
)

const setImage = (i: number) => { activeImageIndex.value = i }
const prevImage = () => {
  const len = images.value.length
  activeImageIndex.value = (activeImageIndex.value - 1 + len) % len
}
const nextImage = () => {
  const len = images.value.length
  activeImageIndex.value = (activeImageIndex.value + 1) % len
}

const STATUS: Record<string, { label: string; color: string }> = {
  en_cours:  { label: 'En cours',  color: '#E65100' },
  termine:   { label: 'Terminé',   color: '#009640' },
  planifie:  { label: 'Planifié',  color: '#1565C0' },
  suspendu:  { label: 'Suspendu',  color: '#757575' },
}
const status = computed(() => STATUS[props.project.status] ?? STATUS.en_cours)

const CATEGORIES: Record<string, string> = {
  infrastructure: 'Infrastructure',
  sante:          'Santé',
  economie:       'Économie',
  education:      'Éducation',
  social:         'Social & Logement',
  environnement:  'Environnement',
}
const categoryLabel = computed(() =>
  CATEGORIES[props.project.category ?? ''] ?? props.project.category ?? '',
)

// Fiche technique (carte liste) : seuls les champs renseignés sont affichés
// Catégorie, budget et dates sont réservés au popup détail
const metaItems = computed(() => [
  { icon: 'fa-solid fa-landmark',             label: 'Maître d\'ouvrage',  value: props.project.maitreOuvrage },
  { icon: 'fa-solid fa-hand-holding-dollar',  label: 'Bailleur',          value: props.project.financement },
  { icon: 'fa-solid fa-helmet-safety',        label: 'Entreprises',       value: props.project.entreprises },
  { icon: 'fa-solid fa-calendar-check',       label: 'Livraison prévue',  value: props.project.livraisonPrevue },
].filter(m => m.value))

const num = computed(() => String((props.index ?? 0) + 1).padStart(2, '0'))

// Barre de progression animée à l'apparition
const cardEl = ref<HTMLElement | null>(null)
const visible = ref(false)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { visible.value = true; obs.disconnect() }
  }, { threshold: 0.25 })
  if (cardEl.value) obs.observe(cardEl.value)
})
</script>

<template>
  <article ref="cardEl" class="pcard" :class="{ 'pcard--reversed': reversed }">

    <!-- ── Galerie ─────────────────────────────────────────────── -->
    <div class="pcard__media" role="button" tabindex="0" @click="emit('open')" @keydown.enter="emit('open')">
      <Transition name="img-fade" mode="out-in">
        <img
          :key="activeImage.src"
          :src="activeImage.src"
          :alt="activeImage.alt"
          class="pcard__img"
        />
      </Transition>

      <!-- Badge statut -->
      <span class="pcard__status" :style="{ background: status.color }">
        <span class="pcard__status-dot" />
        {{ status.label }}
      </span>

      <!-- Légende + compteur -->
      <div class="pcard__media-footer">
        <span class="pcard__caption">{{ activeImage.caption ?? activeImage.alt }}</span>
        <span class="pcard__counter">{{ activeImageIndex + 1 }} / {{ images.length }}</span>
      </div>

      <!-- Flèches -->
      <button v-if="images.length > 1" class="pcard__nav pcard__nav--prev" aria-label="Photo précédente" @click.stop="prevImage">
        <i class="fa-solid fa-chevron-left" />
      </button>
      <button v-if="images.length > 1" class="pcard__nav pcard__nav--next" aria-label="Photo suivante" @click.stop="nextImage">
        <i class="fa-solid fa-chevron-right" />
      </button>
    </div>

    <!-- ── Informations ────────────────────────────────────────── -->
    <div class="pcard__body">

      <div class="pcard__head">
        <span class="pcard__num">{{ num }}</span>
        <div class="pcard__head-txt">
          <p class="pcard__overline">{{ categoryLabel || 'Grand projet municipal' }}</p>
          <h2 class="pcard__title pcard__title--link" @click="emit('open')">{{ project.title }}</h2>
        </div>
      </div>

      <p class="pcard__desc">{{ project.description }}</p>

      <!-- Fiche technique (champs renseignés uniquement) -->
      <div v-if="metaItems.length" class="pcard__meta">
        <div v-for="m in metaItems" :key="m.label" class="pcard__meta-item">
          <span class="pcard__meta-label"><i :class="m.icon" /> {{ m.label }}</span>
          <strong class="pcard__meta-value">{{ m.value }}</strong>
        </div>
      </div>

      <!-- Avancement -->
      <div class="pcard__progress">
        <div class="pcard__progress-head">
          <span class="pcard__progress-label">Niveau d'exécution global</span>
          <span class="pcard__progress-pct" :style="{ color: status.color }">{{ project.progressPercent }}%</span>
        </div>
        <div class="pcard__progress-track" role="progressbar" :aria-valuenow="project.progressPercent" aria-valuemin="0" aria-valuemax="100">
          <div
            class="pcard__progress-bar"
            :style="{ width: visible ? `${project.progressPercent}%` : '0%' }"
          />
        </div>
      </div>

      <!-- Miniatures cliquables -->
      <div v-if="images.length > 1" class="pcard__thumbs">
        <p class="pcard__thumbs-label">
          <i class="fa-regular fa-images" /> Galerie du chantier
        </p>
        <div class="pcard__thumbs-row">
          <button
            v-for="(img, i) in images"
            :key="img.src"
            class="pcard__thumb"
            :class="{ 'pcard__thumb--active': i === activeImageIndex }"
            :aria-label="`Afficher la photo ${i + 1}`"
            @click="setImage(i)"
          >
            <img :src="img.src" :alt="img.alt" loading="lazy" />
          </button>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="project.tags?.length" class="pcard__tags">
        <span v-for="tag in project.tags" :key="tag" class="pcard__tag">#{{ tag }}</span>
      </div>

      <!-- CTA -->
      <button class="pcard__cta" @click="emit('open')">
        Voir le projet <i class="fa-solid fa-arrow-right" />
      </button>

    </div>
  </article>
</template>

<style scoped>
/* ─── Carte ──────────────────────────────────────────────────── */
.pcard {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: white;
  border: 1px solid #EBEBEB;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.pcard:hover {
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}
.pcard--reversed .pcard__media { order: 2; }
.pcard--reversed .pcard__body  { order: 1; }

/* ─── Média ──────────────────────────────────────────────────── */
.pcard__media {
  position: relative;
  min-height: 460px;
  overflow: hidden;
  background: #111;
  cursor: pointer;
}
.pcard__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.img-fade-enter-active, .img-fade-leave-active { transition: opacity 0.3s ease, transform 0.6s ease; }
.img-fade-enter-from  { opacity: 0; transform: scale(1.03); }
.img-fade-leave-to    { opacity: 0; }

.pcard__status {
  position: absolute;
  top: 18px; left: 18px;
  z-index: 3;
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
.pcard__status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

.pcard__media-footer {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 40px 20px 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.72), transparent);
}
.pcard__caption {
  color: rgba(255,255,255,0.92);
  font-size: 0.78rem;
  font-weight: 600;
}
.pcard__counter {
  color: rgba(255,255,255,0.65);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.pcard__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 38px; height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s, background 0.2s;
}
.pcard__media:hover .pcard__nav { opacity: 1; }
.pcard__nav:hover { background: var(--primary-green, #009640); }
.pcard__nav--prev { left: 14px; }
.pcard__nav--next { right: 14px; }

/* ─── Corps ──────────────────────────────────────────────────── */
.pcard__body {
  padding: 40px 44px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pcard__head {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}
.pcard__num {
  font-size: 2.6rem;
  font-weight: 900;
  line-height: 0.9;
  color: transparent;
  -webkit-text-stroke: 1.5px #C9C9C9;
  flex-shrink: 0;
  padding-top: 4px;
}
.pcard__overline {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #E65100;
  margin: 0 0 6px;
}
.pcard__title {
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  font-weight: 900;
  color: #0D0D0D;
  line-height: 1.15;
  margin: 0;
}
.pcard__title--link { cursor: pointer; transition: color 0.2s; }
.pcard__title--link:hover { color: #009640; }

/* CTA */
.pcard__cta {
  align-self: flex-start;
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: 2px solid var(--primary-green, #009640);
  color: var(--primary-green, #009640);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 11px 24px;
  cursor: pointer;
  transition: all 0.25s;
}
.pcard__cta i { transition: transform 0.25s; }
.pcard__cta:hover {
  background: var(--primary-green, #009640);
  color: white;
}
.pcard__cta:hover i { transform: translateX(5px); }

.pcard__desc {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.75;
  margin: 0;
}

/* Fiche technique */
.pcard__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  border: 1px solid #EBEBEB;
  border-left: 3px solid #E65100;
  background: #EBEBEB; /* lignes de séparation via le gap */
}
.pcard__meta-item {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #FAFAF8;
}
/* Si nombre impair d'éléments, le dernier occupe toute la largeur */
.pcard__meta-item:last-child:nth-child(odd) { grid-column: 1 / -1; }
.pcard__meta-label {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pcard__meta-label i { color: #009640; font-size: 0.65rem; }
.pcard__meta-value {
  font-size: 0.82rem;
  color: #1a1a1a;
  font-weight: 700;
}

/* Avancement */
.pcard__progress-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.pcard__progress-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #444;
}
.pcard__progress-pct {
  font-size: 1.15rem;
  font-weight: 900;
}
.pcard__progress-track {
  height: 9px;
  background: #EEE;
  border-radius: 20px;
  overflow: hidden;
}
.pcard__progress-bar {
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(90deg, var(--primary-green, #009640), var(--primary-orange, #E65100));
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Miniatures */
.pcard__thumbs-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #999;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.pcard__thumbs-label i { color: #009640; }
.pcard__thumbs-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pcard__thumb {
  padding: 0;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, opacity 0.2s;
  opacity: 0.75;
}
.pcard__thumb img {
  width: 72px; height: 52px;
  object-fit: cover;
  display: block;
}
.pcard__thumb:hover { opacity: 1; }
.pcard__thumb--active {
  border-color: var(--primary-green, #009640);
  opacity: 1;
}

/* Tags */
.pcard__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
}
.pcard__tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #666;
  background: #F2F2F0;
  padding: 4px 12px;
  transition: all 0.2s;
}
.pcard__tag:hover { background: #E8F5EC; color: #009640; }

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 992px) {
  .pcard { grid-template-columns: 1fr; }
  .pcard--reversed .pcard__media { order: 0; }
  .pcard--reversed .pcard__body  { order: 1; }
  .pcard__media { min-height: 320px; }
  .pcard__body { padding: 28px 24px; }
  .pcard__nav { opacity: 1; }
}
@media (max-width: 576px) {
  .pcard__meta { grid-template-columns: 1fr; }
  .pcard__num { display: none; }
}
</style>
