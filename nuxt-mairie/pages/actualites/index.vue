<script setup lang="ts">
import type { Actualite } from '~/types'

useSeoMeta({
  title: 'Actualités',
  description: 'Toutes les actualités de la Mairie de Bouaké : urbanisme, économie, éducation, culture et santé.',
})

const CATS = [
  { value: 'urbanisme', label: 'Urbanisme & Travaux',  accent: '#E65100' },
  { value: 'economie',  label: 'Économie Locale',       accent: '#009640' },
  { value: 'education', label: 'Éducation & Jeunesse',  accent: '#1565C0' },
  { value: 'culture',   label: 'Culture & Sport',        accent: '#7B1FA2' },
  { value: 'sante',     label: 'Santé & Social',         accent: '#C62828' },
]

const PER_PAGE = 4

// ── Fetch ────────────────────────────────────────────────────────────────────
const { data, pending } = useFetch<{ items: Actualite[]; total: number }>('/api/actualites', {
  query: { perPage: 999 },
  key: 'actu-all',
})

// ── Filtres ──────────────────────────────────────────────────────────────────
const searchText  = ref('')
const selCategory = ref('')
const selYear     = ref('')
const selMonth    = ref('')

watch([searchText, selCategory, selYear, selMonth], () => {
  Object.keys(catOffsets).forEach(k => { catOffsets[k] = 0 })
})

const allArticles = computed<Actualite[]>(() => data.value?.items ?? [])

const getArticleDate = (article: Actualite) => article.date_publication || article.publishedAt

// Filtrage global (search / year / month)
const globalFiltered = computed<Actualite[]>(() => {
  let r = allArticles.value
  if (selYear.value)  r = r.filter(a => new Date(getArticleDate(a)).getFullYear() === Number(selYear.value))
  if (selMonth.value) r = r.filter(a => new Date(getArticleDate(a)).getMonth() + 1 === Number(selMonth.value))
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    r = r.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
  }
  return r
})

// ── Sections par catégorie ────────────────────────────────────────────────────
const sections = computed(() => {
  const cats = selCategory.value
    ? CATS.filter(c => c.value === selCategory.value)
    : CATS

  return cats.map(cat => ({
    ...cat,
    articles: globalFiltered.value.filter(a => a.category === cat.value),
  })).filter(s => s.articles.length > 0)
})

// ── Carrousel par catégorie (défilement 1 par 1) ─────────────────────────────
const catOffsets = reactive<Record<string, number>>({})
const getOffset  = (v: string) => catOffsets[v] ?? 0

const canLeft  = (v: string) => getOffset(v) > 0
const canRight = (v: string, articles: Actualite[]) =>
  getOffset(v) + PER_PAGE < articles.length - 1

const slideLeft  = (v: string) => { catOffsets[v] = Math.max(0, getOffset(v) - 1) }
const slideRight = (v: string, articles: Actualite[]) => {
  catOffsets[v] = Math.min(articles.length - 1 - PER_PAGE, getOffset(v) + 1)
}

const getGridArticles = (cat: string, articles: Actualite[]) => {
  const rest = articles.slice(1)
  return rest.slice(getOffset(cat), getOffset(cat) + PER_PAGE)
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

const getAccent   = (cat: string) => CATS.find(c => c.value === cat)?.accent ?? '#009640'
const getCatLabel = (cat: string) => CATS.find(c => c.value === cat)?.label ?? cat

const YEARS  = ['2026', '2025', '2024']
const MONTHS = [
  { v: '1', l: 'Janvier' },  { v: '2', l: 'Février' },  { v: '3', l: 'Mars' },
  { v: '4', l: 'Avril' },    { v: '5', l: 'Mai' },       { v: '6', l: 'Juin' },
  { v: '7', l: 'Juillet' },  { v: '8', l: 'Août' },      { v: '9', l: 'Septembre' },
  { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' }, { v: '12', l: 'Décembre' },
]
</script>

<template>
  <div class="actu-page">

    <!-- ── Barre de filtres ───────────────────────────────────────────────── -->
    <div class="fbar-wrap">
      <div class="fbar">
        <div class="fbar-search">
          <i class="fa-solid fa-magnifying-glass" />
          <input v-model="searchText" type="search" placeholder="Rechercher un mot-clé..." />
        </div>
        <select v-model="selCategory" class="f-select">
          <option value="">Toutes catégories</option>
          <option v-for="c in CATS" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select v-model="selYear" class="f-select">
          <option value="">Année</option>
          <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="selMonth" class="f-select">
          <option value="">Mois</option>
          <option v-for="m in MONTHS" :key="m.v" :value="m.v">{{ m.l }}</option>
        </select>
      </div>
    </div>

    <!-- ── Chargement ────────────────────────────────────────────────────── -->
    <div v-if="pending" class="loading-state">
      <div class="spinner" />
    </div>

    <template v-else>

      <!-- Aucun résultat -->
      <div v-if="sections.length === 0" class="empty-state">
        <i class="fa-solid fa-newspaper" />
        <p>Aucun article ne correspond à votre recherche.</p>
        <button class="btn-reset" @click="selCategory = ''; searchText = ''; selYear = ''; selMonth = ''">
          Réinitialiser les filtres
        </button>
      </div>

      <!-- ── Sections par catégorie ─────────────────────────────────────── -->
      <section v-for="sec in sections" :key="sec.value" class="cat-section">

        <!-- Titre de la catégorie -->
        <div class="cat-header">
          <span class="cat-accent" :style="{ background: sec.accent }" />
          <h2 class="cat-title">{{ sec.label.toUpperCase() }}</h2>
          <div class="cat-line" />
        </div>

        <!-- Article héros -->
        <NuxtLink :to="`/actualites/${sec.articles[0].slug}`" class="art-hero">
          <div class="art-hero__img">
            <img :src="sec.articles[0].coverImage" :alt="sec.articles[0].coverImageAlt" />
            <span class="art-hero__img-badge" :style="{ background: sec.accent }">
              {{ sec.label }}
            </span>
          </div>
          <div class="art-hero__body" :style="{ background: sec.accent }">
            <span class="art-hero__date">{{ fmt(getArticleDate(sec.articles[0])) }}</span>
            <h2 class="art-hero__title">{{ sec.articles[0].title }}</h2>
            <p class="art-hero__excerpt">{{ sec.articles[0].excerpt }}</p>
            <span class="art-hero__cta">
              Lire l'article <i class="fa-solid fa-arrow-right" />
            </span>
          </div>
        </NuxtLink>

        <!-- Carrousel CSS pur -->
        <template v-if="sec.articles.length > 1">
          <div class="carousel-outer">

            <!-- Flèche gauche -->
            <button
              v-if="canLeft(sec.value)"
              class="carousel-arrow carousel-arrow--left"
              :style="{ borderColor: sec.accent, color: sec.accent }"
              @click="slideLeft(sec.value)"
            ><i class="fa-solid fa-chevron-left" /></button>

            <!-- Fenêtre (overflow hidden) -->
            <div class="carousel-window">
              <!-- Track complet qui glisse en CSS -->
              <div
                class="carousel-track"
                :style="{ transform: `translateX(calc(-${getOffset(sec.value)} * 25%))` }"
              >
                <NuxtLink
                  v-for="art in sec.articles.slice(1)"
                  :key="art.id"
                  :to="`/actualites/${art.slug}`"
                  class="art-card"
                >
                  <div class="art-card__img">
                    <img :src="art.coverImage" :alt="art.coverImageAlt" loading="lazy" />
                    <span class="art-card__badge" :style="{ background: getAccent(art.category) }">
                      {{ getCatLabel(art.category) }}
                    </span>
                  </div>
                  <div class="art-card__body">
                    <span class="art-card__date">{{ fmt(getArticleDate(art)) }}</span>
                    <h3 class="art-card__title">{{ art.title }}</h3>
                    <span class="art-card__cta">
                      Lire <i class="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Flèche droite -->
            <button
              v-if="canRight(sec.value, sec.articles)"
              class="carousel-arrow carousel-arrow--right"
              :style="{ borderColor: sec.accent, color: sec.accent }"
              @click="slideRight(sec.value, sec.articles)"
            ><i class="fa-solid fa-chevron-right" /></button>

          </div>
        </template>

      </section>

    </template>
  </div>
</template>

<style scoped>
/* ─── Page ──────────────────────────────────────────────────────────────── */
.actu-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px 96px;
}

/* ─── Barre de filtres ──────────────────────────────────────────────────── */
.fbar-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-bottom: 1px solid #EBEBEB;
  padding: 12px 0;
  margin-bottom: 48px;
}
.fbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.fbar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 200px;
  border: 1px solid #DDD;
  border-radius: 3px;
  padding: 0 14px;
}
.fbar-search i { color: #BBB; font-size: 0.78rem; flex-shrink: 0; }
.fbar-search input {
  border: none; outline: none;
  width: 100%; padding: 10px 0;
  font-size: 0.85rem; background: transparent;
}
.f-select {
  border: 1px solid #DDD;
  border-radius: 3px;
  padding: 10px 14px;
  font-size: 0.82rem;
  background: white;
  cursor: pointer;
  color: #444;
}

/* ─── Section catégorie ─────────────────────────────────────────────────── */
.cat-section { margin-bottom: 72px; }

.cat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}
.cat-accent {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}
.cat-title {
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  color: #111;
  margin: 0;
  white-space: nowrap;
}
.cat-line {
  flex: 1;
  height: 1px;
  background: #EBEBEB;
}

/* ─── Article héros ─────────────────────────────────────────────────────── */
.art-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  min-height: 400px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  margin-bottom: 20px;
  transition: box-shadow 0.25s;
}
.art-hero:hover { box-shadow: 0 12px 48px rgba(0,0,0,0.14); }

.art-hero__img {
  position: relative;
  overflow: hidden;
}
.art-hero__img img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 0.55s ease;
}
.art-hero:hover .art-hero__img img { transform: scale(1.04); }

.art-hero__img-badge {
  position: absolute;
  top: 16px; left: 16px;
  color: white;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  border-radius: 2px;
}

.art-hero__body {
  padding: 44px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.art-hero__date {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.75);
}
.art-hero__title {
  font-size: 1.55rem;
  font-weight: 800;
  color: white;
  line-height: 1.22;
  margin: 0;
}
.art-hero__excerpt {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.85);
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.art-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  margin-top: 4px;
}
.art-hero__cta i { transition: transform 0.2s; }
.art-hero:hover .art-hero__cta i { transform: translateX(5px); }

/* ─── Grille 4 articles ─────────────────────────────────────────────────── */
.art-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

/* ─── Carte article ─────────────────────────────────────────────────────── */
.art-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  background: white;
  border: 1px solid #EBEBEB;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.art-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.09);
  transform: translateY(-2px);
}
.art-card__img {
  position: relative;
  height: 170px;
  overflow: hidden;
  flex-shrink: 0;
}
.art-card__img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.art-card:hover .art-card__img img { transform: scale(1.06); }
.art-card__badge {
  position: absolute;
  top: 10px; left: 12px;
  color: white;
  font-size: 0.52rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 2px;
}
.art-card__body {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.art-card__date { font-size: 0.68rem; color: #AAA; }
.art-card__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #111;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.art-card__cta {
  font-size: 0.7rem;
  font-weight: 700;
  color: #009640;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: auto;
  padding-top: 4px;
}
.art-card__cta i { font-size: 0.6rem; transition: transform 0.2s; }
.art-card:hover .art-card__cta i { transform: translateX(3px); }

/* ─── Carrousel CSS pur ─────────────────────────────────────────────────── */
.carousel-outer {
  position: relative;
  margin-top: 16px;
}
/* La fenêtre prend 100% = même largeur que le héros */
.carousel-window {
  width: 100%;
  overflow: hidden;
}
.carousel-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
/* Chaque carte = 25% de la fenêtre, gap simulé par padding */
.carousel-track .art-card {
  flex: 0 0 calc(25% - 10.5px);
  margin-right: 14px;
}
.carousel-track .art-card:last-child { margin-right: 0; }

/* Flèches absolues qui débordent dans le padding de la page */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  background: white;
  border: 2px solid currentColor;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  transition: all 0.2s;
  z-index: 5;
}
.carousel-arrow--left  { left: -54px; }
.carousel-arrow--right { right: -54px; }
.carousel-arrow:hover  { background: currentColor; }
.carousel-arrow:hover i { color: white; }

/* ─── Reset ─────────────────────────────────────────────────────────────── */
.btn-reset {
  background: none;
  border: 1.5px solid #CCC;
  border-radius: 3px;
  padding: 10px 28px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reset:hover { border-color: #009640; color: #009640; }

/* ─── États ─────────────────────────────────────────────────────────────── */
.loading-state { display: flex; justify-content: center; padding: 80px 0; }
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #EEE;
  border-top-color: #009640;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 80px 40px; color: #BBB; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; margin-bottom: 20px; color: #999; }

</style>
