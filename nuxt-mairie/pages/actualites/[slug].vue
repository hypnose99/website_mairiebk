<script setup lang="ts">
// pages/actualites/[slug].vue — Page article premium
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: article, error } = await useFetch(`/api/actualites/${slug.value}`, {
  key: `article-${slug.value}`,
})
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
}

// Articles de la même catégorie (sidebar)
const { data: relatedData } = useFetch('/api/actualites', {
  query: { category: article.value?.category, perPage: 6 },
  key: `related-${article.value?.category}`,
  lazy: true,
})
const related = computed(() =>
  (relatedData.value?.items ?? []).filter((a: any) => a.slug !== slug.value).slice(0, 3)
)

// Articles à la une (sidebar)
const { data: featuredData } = useFetch('/api/actualites', {
  query: { perPage: 10 },
  key: 'featured-articles',
  lazy: true,
})
const featured = computed(() =>
  (featuredData.value?.items ?? []).filter((a: any) => a.featured && a.slug !== slug.value).slice(0, 3)
)

const { d } = useI18n()
const formattedDate = computed(() =>
  article.value ? d(new Date(article.value.publishedAt), 'long') : ''
)

// Temps de lecture estimé
// Temps de lecture estimé
const readingTime = computed(() => {
  // Récupère le champ (selon si vous l'avez nommé content ou contenu dans Strapi)
  const rawContent = article.value?.contenu || article.value?.content;
  let text = "";

  if (Array.isArray(rawContent)) {
    // Nouveau format (Strapi Blocks) : on extrait le texte de chaque bloc enfant
    const extractText = (blocks: any[]) => {
      let str = "";
      blocks.forEach(block => {
        if (block.text) str += block.text + " ";
        if (block.children) str += extractText(block.children) + " ";
      });
      return str;
    };
    text = extractText(rawContent);
  } else if (typeof rawContent === "string") {
    // Ancien format (Texte brut/HTML) : on retire les balises
    text = rawContent.replace(/<[^>]*>/g, '');
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
})

// Couleur par catégorie
const categoryColors: Record<string, string> = {
  urbanisme: '#1a6b3c',
  economie:  '#1a4f8a',
  sante:     '#b03a2e',
  education: '#6c3483',
  culture:   '#d35400',
}
const catColor = computed(() => categoryColors[article.value?.category ?? ''] ?? 'var(--primary-green)')

// YouTube embed
const youtubeId = computed(() => {
  const url = article.value?.videoUrl
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : null
})

// Galerie lightbox
const lightboxIndex = ref<number | null>(null)
function openLightbox(i: number) { lightboxIndex.value = i }
function closeLightbox() { lightboxIndex.value = null }
function prevImg() {
  const len = article.value?.gallery?.length ?? 0
  if (lightboxIndex.value !== null) lightboxIndex.value = (lightboxIndex.value - 1 + len) % len
}
function nextImg() {
  const len = article.value?.gallery?.length ?? 0
  if (lightboxIndex.value !== null) lightboxIndex.value = (lightboxIndex.value + 1) % len
}

// ── Vues & Likes (localStorage, sera remplacé par Strapi) ──
function seedFromSlug(s: string, max: number): number {
  let h = 0
  for (const c of s) h = ((h << 5) - h) + c.charCodeAt(0)
  return max + Math.abs(h % (max * 6))
}
const viewCount  = ref(0)
const isLiked    = ref(false)
const likeCount  = ref(0)

// ── Commentaires ──
interface ArticleComment {
  id: string; name: string; text: string; date: string
}
const comments   = ref<ArticleComment[]>([])
const commentForm = reactive({ name: '', text: '' })
const commentSent = ref(false)

onMounted(() => {
  const s = slug.value
  // Vues
  const base = seedFromSlug(s, 200)
  const stored = parseInt(localStorage.getItem(`v_${s}`) ?? '0')
  const next = stored === 0 ? base + 1 : stored + 1
  localStorage.setItem(`v_${s}`, String(next))
  viewCount.value = next
  // Likes
  const baseLikes = Math.floor(seedFromSlug(s, 20) * 0.12)
  const adj = parseInt(localStorage.getItem(`la_${s}`) ?? '0')
  likeCount.value = baseLikes + adj
  isLiked.value = localStorage.getItem(`lk_${s}`) === '1'
  // Commentaires
  const raw = localStorage.getItem(`cm_${s}`)
  if (raw) comments.value = JSON.parse(raw)
})

function toggleLike() {
  const s = slug.value
  if (isLiked.value) {
    isLiked.value = false; likeCount.value--
    localStorage.setItem(`lk_${s}`, '0')
    localStorage.setItem(`la_${s}`, String(parseInt(localStorage.getItem(`la_${s}`) ?? '0') - 1))
  } else {
    isLiked.value = true; likeCount.value++
    localStorage.setItem(`lk_${s}`, '1')
    localStorage.setItem(`la_${s}`, String(parseInt(localStorage.getItem(`la_${s}`) ?? '0') + 1))
  }
}
function submitComment() {
  if (!commentForm.name.trim() || !commentForm.text.trim()) return
  const c: ArticleComment = {
    id: Date.now().toString(),
    name: commentForm.name.trim(),
    text: commentForm.text.trim(),
    date: new Date().toISOString(),
  }
  comments.value.unshift(c)
  localStorage.setItem(`cm_${slug.value}`, JSON.stringify(comments.value))
  commentForm.name = ''; commentForm.text = ''
  commentSent.value = true
  setTimeout(() => commentSent.value = false, 4000)
}
function commentDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}
function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Partage
function shareWhatsApp() {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(article.value?.title ?? '')
  window.open(`https://wa.me/?text=${title}%20${url}`, '_blank')
}
function copyLink() { navigator.clipboard.writeText(window.location.href) }

// Barre de progression
const scrollProgress = ref(0)
function updateProgress() {
  const h = document.documentElement
  const sh = h.scrollHeight - h.clientHeight
  scrollProgress.value = sh > 0 ? Math.min(100, (window.scrollY / sh) * 100) : 0
}
onMounted(() => window.addEventListener('scroll', updateProgress, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', updateProgress))

useSeoMeta({
  title: () => article.value?.title ?? 'Article',
  description: () => article.value?.excerpt,
  ogImage: () => article.value?.coverImage,
})
</script>

<template>
  <div v-if="article">

    <!-- ░░ BARRE DE PROGRESSION ░░ -->
    <div class="reading-bar" :style="{ width: scrollProgress + '%' }" />

    <!-- ░░ HERO CINÉMATIQUE ░░ -->
    <section class="article-hero" :style="{ '--cat-color': catColor }">
      <div class="hero-bg" :style="{ backgroundImage: `url(${article.coverImage})` }" />
      <div class="hero-overlay" />
      <div class="hero-content container">
        <nav class="hero-breadcrumb">
          <NuxtLink to="/">Accueil</NuxtLink><span>/</span>
          <NuxtLink to="/actualites">Actualités</NuxtLink><span>/</span>
          <span>{{ article.categoryLabel }}</span>
        </nav>
        <span class="hero-category-badge" :style="{ background: catColor }">{{ article.categoryLabel }}</span>
        <h1 class="hero-title">{{ article.title }}</h1>
        <p class="hero-excerpt">{{ article.excerpt }}</p>
        <div class="hero-meta">
          <span class="hero-meta-item"><i class="bi bi-person-fill" /> {{ article.author }}</span>
          <span class="hero-meta-sep" />
          <span class="hero-meta-item">
            <i class="bi bi-calendar3" />
            <time :datetime="article.publishedAt">{{ formattedDate }}</time>
          </span>
          <span class="hero-meta-sep" />
          <span class="hero-meta-item"><i class="bi bi-clock" /> {{ readingTime }} min de lecture</span>
          <span class="hero-meta-sep" />
          <span class="hero-meta-item"><i class="bi bi-eye" /> {{ viewCount.toLocaleString('fr-FR') }} vues</span>
          <span class="hero-meta-sep" />
          <button class="hero-like-btn" :class="{ liked: isLiked }" @click="toggleLike">
            <i :class="isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'" />
            {{ likeCount }}
          </button>
        </div>
      </div>
      <div class="hero-scroll-hint"><i class="bi bi-chevron-double-down" /></div>
    </section>

    <!-- ░░ CORPS + SIDEBAR ░░ -->
    <div class="article-layout container">

      <!-- Colonne principale -->
      <main class="article-main" :style="{ '--cat-color': catColor }">

        <!-- Contenu -->
        <div class="article-content-box">
          <div class="article-accent-bar" :style="{ background: catColor }" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="article-content">
            <StrapiBlocksText :nodes="article.content" />
          </div>
        </div>

        <!-- Tags -->
        <div v-if="article.tags?.length" class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="tag-chip">
            <i class="bi bi-hash" />{{ tag }}
          </span>
        </div>

        <!-- Galerie photos -->
        <div v-if="article.gallery?.length" class="article-gallery-block">
          <div class="block-label" :style="{ borderColor: catColor, color: catColor }">
            <i class="bi bi-images" /> Galerie photos ({{ article.gallery.length }})
          </div>
          <div class="gallery-mosaic">
            <div
              v-for="(img, i) in article.gallery"
              :key="i"
              class="mosaic-item"
              :class="{ 'mosaic-large': i === 0 }"
              @click="openLightbox(i)"
            >
              <img :src="img.url ?? img" :alt="`Photo ${i + 1}`" />
              <div class="mosaic-hover"><i class="bi bi-zoom-in" /></div>
            </div>
          </div>
        </div>

        <!-- Vidéo YouTube -->
        <div v-if="youtubeId" class="article-video-block">
          <div class="block-label" :style="{ borderColor: catColor, color: catColor }">
            <i class="bi bi-play-circle-fill" /> Vidéo
          </div>
          <div class="video-responsive">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeId}?rel=0`"
              title="Vidéo de l'article"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>

        <!-- Partage -->
        <div class="article-share">
          <span class="share-label">Partager :</span>
          <button class="share-btn share-wa" @click="shareWhatsApp">
            <i class="bi bi-whatsapp" /> WhatsApp
          </button>
          <button class="share-btn share-copy" @click="copyLink">
            <i class="bi bi-link-45deg" /> Copier le lien
          </button>
        </div>

        <!-- ░░ COMMENTAIRES ░░ -->
        <section class="comments-section">
          <div class="block-label" :style="{ borderColor: catColor, color: catColor }">
            <i class="bi bi-chat-dots" /> Commentaires
            <span class="comments-count">{{ comments.length }}</span>
          </div>

          <!-- Liste -->
          <div v-if="comments.length" class="comments-list">
            <div v-for="c in comments" :key="c.id" class="comment-item">
              <div class="comment-avatar" :style="{ background: catColor }">{{ initials(c.name) }}</div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-name">{{ c.name }}</span>
                  <span class="comment-date">{{ commentDate(c.date) }}</span>
                </div>
                <p class="comment-text">{{ c.text }}</p>
              </div>
            </div>
          </div>
          <p v-else class="no-comments">Soyez le premier à commenter cet article.</p>

          <!-- Formulaire -->
          <div class="comment-form">
            <h4 class="comment-form-title">Laisser un commentaire</h4>
            <Transition name="fade">
              <div v-if="commentSent" class="comment-success">
                <i class="bi bi-check-circle-fill" /> Commentaire publié avec succès.
              </div>
            </Transition>
            <div class="form-row">
              <input
                v-model="commentForm.name"
                type="text"
                placeholder="Votre nom *"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <textarea
                v-model="commentForm.text"
                placeholder="Votre commentaire *"
                rows="4"
                class="form-input form-textarea"
              />
            </div>
            <button
              class="btn-submit-comment"
              :style="{ background: catColor }"
              @click="submitComment"
            >
              <i class="bi bi-send" /> Publier
            </button>
          </div>
        </section>

        <!-- Retour -->
        <NuxtLink to="/actualites" class="btn-retour">
          <i class="bi bi-arrow-left" /> Toutes les actualités
        </NuxtLink>

      </main>

      <!-- ░░ SIDEBAR ░░ -->
      <aside class="article-sidebar">

        <!-- Même catégorie -->
        <div v-if="related.length" class="sidebar-block">
          <h3 class="sidebar-title">
            <span class="sidebar-title-accent" :style="{ background: catColor }" />
            Dans la même catégorie
          </h3>
          <div class="sidebar-articles">
            <NuxtLink
              v-for="rel in related"
              :key="rel.slug"
              :to="`/actualites/${rel.slug}`"
              class="sidebar-card"
            >
              <img :src="rel.coverImage" :alt="rel.title" class="sidebar-card-img" />
              <div class="sidebar-card-body">
                <p class="sidebar-card-title">{{ rel.title }}</p>
                <span class="sidebar-card-date">{{ d(new Date(rel.publishedAt), 'short') }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- À la une -->
        <div v-if="featured.length" class="sidebar-block">
          <h3 class="sidebar-title">
            <span class="sidebar-title-accent" style="background: var(--primary-orange)" />
            À la une
          </h3>
          <div class="sidebar-featured">
            <NuxtLink
              v-for="art in featured"
              :key="art.slug"
              :to="`/actualites/${art.slug}`"
              class="featured-row"
            >
              <img :src="art.coverImage" :alt="art.title" class="featured-row-img" />
              <div>
                <span class="featured-cat-badge" :style="{ background: categoryColors[art.category] ?? 'var(--primary-green)' }">
                  {{ art.categoryLabel }}
                </span>
                <p class="featured-row-title">{{ art.title }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Contact mairie -->
        <div class="sidebar-contact">
          <i class="bi bi-telephone-fill sidebar-contact-icon" />
          <div>
            <p class="sidebar-contact-label">Service Communication</p>
            <p class="sidebar-contact-value">Mairie de Bouaké</p>
          </div>
        </div>

      </aside>
    </div>

    <!-- ░░ LIGHTBOX ░░ -->
    <Teleport to="body">
      <div
        v-if="lightboxIndex !== null && article.gallery?.length"
        class="lightbox"
        @click.self="closeLightbox"
      >
        <button class="lb-close" @click="closeLightbox">✕</button>
        <button class="lb-nav lb-prev" @click="prevImg"><i class="bi bi-chevron-left" /></button>
        <img
          :src="article.gallery[lightboxIndex].url ?? article.gallery[lightboxIndex]"
          :alt="`Photo ${lightboxIndex + 1}`"
          class="lb-img"
        />
        <button class="lb-nav lb-next" @click="nextImg"><i class="bi bi-chevron-right" /></button>
        <div class="lb-counter">{{ lightboxIndex + 1 }} / {{ article.gallery.length }}</div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* ════════════════════════════════════════
   BARRE DE PROGRESSION
════════════════════════════════════════ */
.reading-bar {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: linear-gradient(to right, var(--primary-green), var(--primary-orange));
  z-index: 9999;
  transition: width 0.08s linear;
}

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
.article-hero {
  position: relative;
  min-height: 580px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.04);
  transition: transform 8s ease;
}
.article-hero:hover .hero-bg { transform: scale(1); }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.82) 100%);
}
.hero-content {
  position: relative; z-index: 2;
  padding-bottom: 60px; padding-top: 120px;
  max-width: 860px;
}
.hero-breadcrumb {
  display: flex; gap: 8px; align-items: center;
  color: rgba(255,255,255,0.7); font-size: 13px; margin-bottom: 18px;
}
.hero-breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
.hero-breadcrumb a:hover { color: #fff; }
.hero-breadcrumb span:not(:last-child) { opacity: 0.5; }
.hero-category-badge {
  display: inline-block; color: #fff;
  font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 4px 14px; border-radius: 3px; margin-bottom: 16px;
}
.hero-title {
  font-size: clamp(26px, 4vw, 46px); font-weight: 900; color: #fff;
  line-height: 1.15; margin-bottom: 16px; text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.hero-excerpt {
  color: rgba(255,255,255,0.85); font-size: 17px; line-height: 1.6;
  max-width: 680px; margin-bottom: 24px;
}
.hero-meta {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
}
.hero-meta-item {
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.75); font-size: 13px;
}
.hero-meta-sep { width: 1px; height: 14px; background: rgba(255,255,255,0.3); }
.hero-like-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px; cursor: pointer; transition: all 0.2s;
}
.hero-like-btn:hover,
.hero-like-btn.liked {
  background: #e63946; border-color: #e63946; color: #fff;
}
.hero-like-btn.liked i { color: #fff; }
.hero-scroll-hint {
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.4); font-size: 20px; z-index: 2;
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}

/* ════════════════════════════════════════
   LAYOUT
════════════════════════════════════════ */
.article-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 50px;
  padding-top: 50px;
  padding-bottom: 80px;
  align-items: start;
}

/* ════════════════════════════════════════
   CONTENU PRINCIPAL
════════════════════════════════════════ */
.article-main { min-width: 0; }
.article-content-box { display: flex; gap: 24px; margin-bottom: 32px; }
.article-accent-bar { width: 4px; border-radius: 4px; flex-shrink: 0; }
.article-content { font-size: 17px; line-height: 1.9; color: #2a2a2a; flex: 1; }
.article-content :deep(p:first-of-type::first-letter) {
  float: left; font-size: 4.8rem; line-height: 0.78; font-weight: 900;
  color: v-bind(catColor); margin: 0.06em 0.12em 0 0;
  font-family: Georgia, 'Times New Roman', serif;
}
.article-content :deep(p) { margin-bottom: 20px; }
.article-content :deep(h2) {
  font-size: 22px; font-weight: 800; color: #1a1a1a;
  margin: 36px 0 14px; padding-left: 14px; border-left: 4px solid v-bind(catColor);
}
.article-content :deep(blockquote) {
  margin: 32px 0; padding: 20px 24px; background: #f8f8f8;
  border-left: 5px solid v-bind(catColor); border-radius: 0 8px 8px 0;
  font-style: italic; font-size: 18px; color: #444;
}
.article-content :deep(img) { width: 100%; border-radius: 8px; margin: 20px 0; }

/* Tags */
.article-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
.tag-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 5px 14px; background: #f2f2f2; border-radius: 30px;
  font-size: 13px; color: #555; cursor: default; transition: all 0.2s;
}
.tag-chip:hover { background: #e8e8e8; color: #222; }

/* Label section */
.block-label {
  font-size: 15px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.06em; border-left: 4px solid; padding-left: 12px;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}
.comments-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: v-bind(catColor); font-size: 11px; font-weight: 900;
  color: white; opacity: 0.9;
}

/* Galerie */
.article-gallery-block { margin-bottom: 48px; }
.gallery-mosaic {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px;
  gap: 10px;
}
.mosaic-item {
  position: relative; border-radius: 6px; overflow: hidden; cursor: pointer;
}
.mosaic-large { grid-column: span 2; grid-row: span 2; }
.mosaic-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; display: block; }
.mosaic-item:hover img { transform: scale(1.06); }
.mosaic-hover {
  position: absolute; inset: 0; background: rgba(0,0,0,0.38);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 30px; opacity: 0; transition: opacity 0.3s;
}
.mosaic-item:hover .mosaic-hover { opacity: 1; }

/* Vidéo */
.article-video-block { margin-bottom: 48px; }
.video-responsive {
  position: relative; padding-bottom: 56.25%;
  border-radius: 8px; overflow: hidden; background: #000;
}
.video-responsive iframe { position: absolute; inset: 0; width: 100%; height: 100%; }

/* Partage */
.article-share {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 48px;
}
.share-label { font-weight: 700; font-size: 14px; color: #444; }
.share-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 600;
  border: none; cursor: pointer; transition: all 0.2s;
}
.share-wa { background: #25D366; color: white; }
.share-wa:hover { background: #1ebe5d; }
.share-copy { background: #f0f0f0; color: #333; }
.share-copy:hover { background: #e0e0e0; }

/* ════════════════════════════════════════
   COMMENTAIRES
════════════════════════════════════════ */
.comments-section { margin-bottom: 48px; }

.comments-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 36px; }
.comment-item {
  display: flex; gap: 16px; padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-avatar {
  width: 42px; height: 42px; border-radius: 0;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 14px; font-weight: 800; flex-shrink: 0;
}
.comment-body { flex: 1; }
.comment-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
.comment-name { font-weight: 700; font-size: 14px; color: #1a1a1a; }
.comment-date { font-size: 12px; color: #aaa; }
.comment-text { font-size: 15px; line-height: 1.7; color: #444; margin: 0; }
.no-comments { color: #aaa; font-size: 14px; font-style: italic; padding: 16px 0; }

/* Formulaire commentaire */
.comment-form {
  background: #f8f8f8;
  border-left: 4px solid v-bind(catColor);
  padding: 28px;
  margin-top: 8px;
}
.comment-form-title { font-size: 16px; font-weight: 800; color: #1a1a1a; margin-bottom: 20px; }
.comment-success {
  display: flex; align-items: center; gap: 8px;
  color: #1a6b3c; background: #e8f5e9; padding: 12px 16px;
  font-size: 14px; font-weight: 600; margin-bottom: 16px;
  border-left: 4px solid #1a6b3c;
}
.form-row { margin-bottom: 14px; }
.form-input {
  width: 100%; padding: 11px 14px;
  border: 1px solid #ddd; border-radius: 0;
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color 0.2s; background: #fff;
  box-sizing: border-box;
}
.form-input:focus { border-color: v-bind(catColor); }
.form-textarea { resize: vertical; min-height: 100px; }
.btn-submit-comment {
  display: inline-flex; align-items: center; gap: 8px;
  color: white; border: none; padding: 11px 24px;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.btn-submit-comment:hover { opacity: 0.88; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Retour */
.btn-retour {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border: 2px solid var(--primary-green);
  color: var(--primary-green); text-decoration: none;
  border-radius: 0; font-weight: 700; font-size: 14px; transition: all 0.2s;
}
.btn-retour:hover { background: var(--primary-green); color: white; }

/* ════════════════════════════════════════
   SIDEBAR — SANS BORDS ARRONDIS
════════════════════════════════════════ */
.article-sidebar {
  position: sticky; top: 90px;
  display: flex; flex-direction: column; gap: 0;
}
.sidebar-block {
  background: #fff;
  border-left: 4px solid #e8e8e8;
  padding: 24px;
  margin-bottom: 28px;
}
.sidebar-title {
  font-size: 13px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: #1a1a1a; margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}
.sidebar-title-accent { display: inline-block; width: 4px; height: 16px; flex-shrink: 0; }

/* Cards catégorie */
.sidebar-articles { display: flex; flex-direction: column; gap: 0; }
.sidebar-card {
  display: flex; gap: 12px; text-decoration: none;
  align-items: flex-start; padding: 12px 0;
  border-bottom: 1px solid #f2f2f2; transition: padding-left 0.2s;
}
.sidebar-card:last-child { border-bottom: none; }
.sidebar-card:hover { padding-left: 4px; }
.sidebar-card-img { width: 68px; height: 52px; object-fit: cover; flex-shrink: 0; }
.sidebar-card-body { flex: 1; }
.sidebar-card-title {
  font-size: 13px; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-bottom: 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.sidebar-card-date { font-size: 11px; color: #aaa; }

/* À la une */
.sidebar-featured { display: flex; flex-direction: column; gap: 0; }
.featured-row {
  display: flex; gap: 12px; text-decoration: none;
  align-items: flex-start; padding: 12px 0;
  border-bottom: 1px solid #f2f2f2; transition: padding-left 0.2s;
}
.featured-row:last-child { border-bottom: none; }
.featured-row:hover { padding-left: 4px; }
.featured-row-img { width: 60px; height: 48px; object-fit: cover; flex-shrink: 0; }
.featured-cat-badge {
  display: inline-block; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; color: white;
  padding: 2px 8px; margin-bottom: 4px;
}
.featured-row-title {
  font-size: 12px; font-weight: 600; color: #1a1a1a; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Contact */
.sidebar-contact {
  background: var(--primary-green);
  padding: 20px;
  display: flex; align-items: center; gap: 14px; color: white;
}
.sidebar-contact-icon { font-size: 28px; opacity: 0.9; }
.sidebar-contact-label { font-size: 12px; opacity: 0.75; margin-bottom: 2px; }
.sidebar-contact-value { font-size: 15px; font-weight: 700; }

/* ════════════════════════════════════════
   LIGHTBOX
════════════════════════════════════════ */
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.94);
  z-index: 9999; display: flex; align-items: center; justify-content: center;
}
.lb-img { max-width: 88vw; max-height: 84vh; object-fit: contain; }
.lb-close {
  position: absolute; top: 20px; right: 24px;
  background: rgba(255,255,255,0.12); border: none; color: white;
  width: 40px; height: 40px; border-radius: 50%; font-size: 18px;
  cursor: pointer; transition: background 0.2s;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }
.lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.12); border: none; color: white;
  width: 48px; height: 48px; border-radius: 50%; font-size: 20px;
  cursor: pointer; transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.lb-nav:hover { background: rgba(255,255,255,0.25); }
.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-counter { position: absolute; bottom: 22px; font-size: 13px; color: rgba(255,255,255,0.55); }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
@media (max-width: 900px) {
  .article-layout { grid-template-columns: 1fr; gap: 40px; }
  .article-sidebar { position: static; }
  .gallery-mosaic { grid-template-columns: repeat(2, 1fr); }
  .mosaic-large { grid-column: span 2; grid-row: span 1; }
}
@media (max-width: 600px) {
  .article-hero { min-height: 420px; }
  .hero-title { font-size: 24px; }
  .hero-excerpt { display: none; }
  .gallery-mosaic { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 130px; }
  .mosaic-large { grid-column: span 2; grid-row: span 1; }
  .comment-form { padding: 20px 16px; }
}
</style>
