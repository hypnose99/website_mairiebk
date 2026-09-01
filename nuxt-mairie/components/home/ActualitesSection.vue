<script setup lang="ts">
export interface Article {
  id: number
  coverImage?: string | null
  coverImageAlt?: string
  category: string
  date: string
  title: string
  href: string
}

const props = defineProps<{ articles: Article[] }>()

// Divise les articles en groupes de 4 pour le carousel
const slides = computed(() => {
  const result: Article[][] = []
  for (let i = 0; i < props.articles.length; i += 4) {
    result.push(props.articles.slice(i, i + 4))
  }
  return result
})

const slideIndex = ref(0)
const prev = () => { slideIndex.value = Math.max(0, slideIndex.value - 1) }
const next = () => { slideIndex.value = Math.min(slides.value.length - 1, slideIndex.value + 1) }
</script>

<template>
  <section class="s-news">
    <div class="s-section-head container-wide">
      <p class="section-overline">La ville en direct</p>
      <div class="section-head-row">
        <h2 class="section-title">Actualités Récentes</h2>
        <NuxtLink to="/actualites" class="section-link">Toutes les actualités →</NuxtLink>
      </div>
    </div>

    <div class="container-wide">
      <Transition name="fade-tab" mode="out-in">
        <div :key="slideIndex" class="news-grid">
          <NuxtLink v-for="art in slides[slideIndex]" :key="art.id" :to="art.href" class="n-card">
            <div class="n-card__img">
              <img
                :src="art.coverImage ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80'"
                :alt="art.coverImageAlt ?? art.title"
              />
            </div>
            <div class="n-card__body">
              <div class="n-card__meta">
                <span class="n-cat">{{ art.category }}</span>
                <span class="n-date">{{ art.date }}</span>
              </div>
              <h3 class="n-title">{{ art.title }}</h3>
              <span class="n-more">Lire l'article →</span>
            </div>
          </NuxtLink>
        </div>
      </Transition>

      <div class="news-controls">
        <button class="news-ctrl" :disabled="slideIndex === 0" @click="prev">‹ Précédent</button>
        <button class="news-ctrl" :disabled="slideIndex === slides.length - 1" @click="next">Suivant ›</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.s-news { background: #F7F7F5; padding: 80px 0 60px; border-top: 1px solid #EBEBEB; }
.s-section-head { margin-bottom: 56px; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 48px; }
.section-overline { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #E65100; margin-bottom: 8px; }
.section-head-row { display: flex; justify-content: space-between; align-items: flex-end; }
.section-title { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 900; color: #0D0D0D; text-transform: uppercase; letter-spacing: -0.01em; margin: 0; line-height: 1; }
.section-link { font-size: 0.85rem; font-weight: 700; color: #009640; text-decoration: none; letter-spacing: 0.02em; white-space: nowrap; padding-bottom: 2px; border-bottom: 1px solid #009640; }

.news-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; background: #F7F7F5; margin-top: 48px; }
.n-card { background: white; display: flex; flex-direction: column; text-decoration: none; transition: transform 0.2s; }
.n-card:hover { transform: translateY(-4px); }
.n-card__img { height: 200px; overflow: hidden; }
.n-card__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.n-card:hover .n-card__img img { transform: scale(1.05); }
.n-card__body { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.n-card__meta { display: flex; justify-content: space-between; align-items: center; }
.n-cat { background: #009640; color: white; font-size: 0.6rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; }
.n-date { font-size: 0.72rem; color: #999; }
.n-title { font-size: 0.95rem; font-weight: 700; color: #0D0D0D; line-height: 1.4; margin: 0; flex: 1; }
.n-more { font-size: 0.75rem; font-weight: 700; color: #E65100; text-transform: uppercase; letter-spacing: 0.06em; margin-top: auto; }

.news-controls { display: flex; gap: 8px; margin-top: 24px; }
.news-ctrl {
  background: none; border: 1px solid #EBEBEB; padding: 10px 20px;
  font-size: 0.8rem; font-weight: 700; color: #555; cursor: pointer;
  transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.06em;
}
.news-ctrl:hover:not(:disabled) { background: #0D0D0D; color: white; border-color: #0D0D0D; }
.news-ctrl:disabled { opacity: 0.35; cursor: default; }

.fade-tab-enter-active, .fade-tab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-tab-enter-from, .fade-tab-leave-to { opacity: 0; transform: translateY(6px); }

@media (max-width: 1100px) { .news-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .container-wide { padding: 0 20px; } .news-grid { grid-template-columns: 1fr; } }
</style>
