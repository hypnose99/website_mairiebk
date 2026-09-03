<script setup lang="ts">
// components/ui/NewsCard.vue — Carte article actualité
import type { Actualite } from '~/types'

const props = defineProps<{
  article: Actualite
  variant?: 'featured' | 'compact'
}>()

const { d } = useI18n()

const formattedDate = computed(() =>
  d(new Date(props.article.date_publication || props.article.publishedAt), 'short')
)
</script>

<template>
  <NuxtLink
    :to="`/actualites/${article.slug}`"
    class="news-card"
    :class="`news-card--${variant ?? 'compact'}`"
  >
    <div class="news-card__img-wrapper">
      <img
        :src="article.coverImage"
        :alt="article.coverImageAlt"
        loading="lazy"
      />
    </div>
    <div class="news-card__body">
      <div class="news-card__meta">
        <span class="news-card__badge">{{ article.categoryLabel }}</span>
        <span class="news-card__date">{{ formattedDate }}</span>
      </div>
      <h3 class="news-card__title">{{ article.title }}</h3>
      <p v-if="variant === 'featured'" class="news-card__excerpt">
        {{ article.excerpt }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.news-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}
.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.news-card__img-wrapper img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.news-card--featured .news-card__img-wrapper img { height: 280px; }

.news-card__body { padding: 18px; }

.news-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.news-card__badge {
  background: var(--primary-green);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
  text-transform: uppercase;
}

.news-card__date {
  font-size: 13px;
  color: #999;
}

.news-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px;
  line-height: 1.4;
}

.news-card__excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
