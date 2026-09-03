<script setup lang="ts">
export interface Post {
  id?: number
  category: string
  date: string
  title: string
  excerpt: string
  img: string
  href: string
  author: string
  readTime: string
}

const props = defineProps<{ post: Post | null; pending?: boolean }>()

// Résumé limité à 20 mots, terminé par "..." s'il a été raccourci.
const shortExcerpt = computed(() => {
  const text = props.post?.excerpt?.trim() ?? ''
  if (!text) return ''
  const words = text.split(/\s+/)
  return words.length > 20 ? `${words.slice(0, 20).join(' ')}...` : text
})
</script>

<template>
  <div class="col-chart">
    <p class="block-label">
      <span class="flag-chip" aria-hidden="true">
        <i class="fc fc--orange" /><i class="fc fc--white" /><i class="fc fc--green" />
      </span>
      À la une
    </p>

    <!-- Carte -->
    <NuxtLink v-if="post" :to="post.href" class="pdj">
      <div class="pdj__flagline" aria-hidden="true" />

      <div class="pdj__frame">
        <img :src="post.img" :alt="post.title" class="pdj__img" />
        <span class="pdj__category">{{ post.category }}</span>

        <!-- Bandeau bas : dégradé noir, texte blanc -->
        <div class="pdj__overlay">
          <h2 class="pdj__title">{{ post.title }}</h2>
          <p class="pdj__excerpt">{{ shortExcerpt }}</p>
          <div class="pdj__meta">
            <span class="pdj__meta-item"><i class="bi bi-calendar3" /> {{ post.date }}</span>
            <span class="pdj__meta-sep" />
            <span class="pdj__meta-item"><i class="bi bi-clock" /> {{ post.readTime }} de lecture</span>
          </div>
        </div>
      </div>
    </NuxtLink>

    <!-- Skeleton (chargement lazy) -->
    <div v-else-if="pending" class="pdj-skeleton" role="status" aria-live="polite">
      <div class="pdj-skeleton__flagline" />
      <div class="pdj-skeleton__frame">
        <div class="pdj-skeleton__overlay">
          <div class="pdj-skeleton__line pdj-skeleton__line--title" />
          <div class="pdj-skeleton__line" />
          <div class="pdj-skeleton__line pdj-skeleton__line--short" />
        </div>
      </div>
    </div>

    <!-- Rien à afficher -->
    <div v-else class="pdj-empty">Aucune actualité à la une pour le moment.</div>
  </div>
</template>

<style scoped>
/* Padding haut identique à .side-block (32px) pour que le haut de la carte
   s'aligne avec les cartes Événements / Flash Info des colonnes voisines. */
.col-chart { display: flex; flex-direction: column; width: 100%; padding: 32px 20px 16px; }

/* Même gabarit que .block-label dans EventCarousel.vue / FlashInfo.vue */
.block-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: #009640; margin: 0 0 20px;
}
.flag-chip { display: inline-flex; gap: 2px; flex-shrink: 0; }
.fc { display: block; width: 6px; height: 10px; }
.fc--orange { background: #F77F00; }
.fc--white  { background: #FFF; border: 1px solid #DDDBD2; }
.fc--green  { background: #009640; }

/* ── Carte "À la une" — image pleine largeur, texte sur fond noir flouté ── */
.pdj {
  position: relative;
  display: block;
  width: 100%;
  background: white;
  border: 1px solid #EBEBEB;
  border-radius: 0;
  text-decoration: none;
}

/* Liseré tricolore, écho du bandeau héros */
.pdj__flagline {
  height: 4px;
  background: linear-gradient(
    to right,
    #F77F00 0 33.34%,
    #FFFFFF 33.34% 66.67%,
    #009640 66.67% 100%
  );
}

.pdj__frame { position: relative; overflow: hidden; height: 480px; }
.pdj__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.pdj:hover .pdj__img { transform: scale(1.04); }
.pdj__category {
  position: absolute; top: 0; left: 0; z-index: 2;
  background: #E65100; color: white;
  font-size: 0.66rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 7px 14px;
}

/* Bandeau bas : couche noire + flou, texte blanc */
.pdj__overlay {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 1;
  padding: 32px 24px 22px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.75) 45%, rgba(0, 0, 0, 0.35) 75%, transparent 100%);
}
.pdj__title {
  font-size: 1.3rem;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0 0 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pdj__excerpt {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pdj__meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  font-size: 0.74rem; color: rgba(255, 255, 255, 0.75);
}
.pdj__meta-item { display: inline-flex; align-items: center; gap: 6px; }
.pdj__meta-item i { color: #F5A623; }
.pdj__meta-sep { width: 1px; height: 12px; background: rgba(255, 255, 255, 0.35); }

/* ── Skeleton (chargement lazy) ──────────────────────────────────────── */
.pdj-skeleton { display: flex; flex-direction: column; }
.pdj-skeleton__flagline { height: 4px; background: #EBEBEB; }
.pdj-skeleton__frame {
  position: relative; height: 480px; border: 1px solid #EBEBEB; border-top: none;
  background: linear-gradient(90deg, #EBEBEB 25%, #F7F6F2 50%, #EBEBEB 75%);
  background-size: 200% 100%;
  animation: pdj-shimmer 1.2s infinite;
}
.pdj-skeleton__overlay {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 32px 24px 22px;
  display: flex; flex-direction: column; gap: 12px;
}
.pdj-skeleton__line {
  height: 14px;
  background: rgba(255, 255, 255, 0.5);
}
.pdj-skeleton__line--title { width: 70%; height: 22px; }
.pdj-skeleton__line--short { width: 45%; }
@keyframes pdj-shimmer { to { background-position: -200% 0; } }

/* ── État vide ────────────────────────────────────────────────────────── */
.pdj-empty {
  display: flex; align-items: center; justify-content: center;
  flex: 1; min-height: 200px;
  border: 1px solid #EBEBEB;
  color: #999; font-size: 0.85rem;
}
</style>
