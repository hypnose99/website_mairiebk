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

defineProps<{ post: Post }>()
</script>

<template>
  <div class="col-chart">
    <div class="pdj-card">
      <a :href="post.href" class="pdj-img-wrap">
        <img :src="post.img" :alt="post.title" class="pdj-img" />
        <span class="pdj-category">{{ post.category }}</span>
      </a>
      <div class="pdj-body">
        <div class="pdj-meta">
          <span class="pdj-date"><i class="bi bi-calendar3" /> {{ post.date }}</span>
          <span class="pdj-sep">·</span>
          <span class="pdj-read"><i class="bi bi-clock" /> {{ post.readTime }} de lecture</span>
        </div>
        <h2 class="pdj-title">{{ post.title }}</h2>
        <p class="pdj-excerpt">{{ post.excerpt }}</p>
        <div class="pdj-footer">
          <span class="pdj-author"><i class="bi bi-pencil-fill" /> {{ post.author }}</span>
          <a :href="post.href" class="pdj-btn">Lire la suite →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.col-chart { display: flex; align-items: flex-start; padding: 16px 20px; }
.pdj-card {
  display: flex; flex-direction: column; background: white; border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; transition: box-shadow 0.3s;
}
.pdj-card:hover { box-shadow: 0 8px 36px rgba(0,0,0,0.13); }
.pdj-img-wrap { position: relative; display: block; overflow: hidden; height: 320px; flex-shrink: 0; }
.pdj-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.pdj-card:hover .pdj-img { transform: scale(1.04); }
.pdj-category {
  position: absolute; top: 14px; left: 14px; background: #E65100; color: white;
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  padding: 4px 10px; border-radius: 20px;
}
.pdj-body { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; flex: 1; }
.pdj-meta { display: flex; align-items: center; gap: 8px; color: #888; font-size: 0.78rem; }
.pdj-sep { color: #ccc; }
.pdj-title { font-size: 1.15rem; font-weight: 700; color: #0D0D0D; line-height: 1.35; }
.pdj-excerpt { font-size: 0.875rem; color: #555; line-height: 1.65; flex: 1; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.pdj-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 14px; border-top: 1px solid #f0f0f0; }
.pdj-author { font-size: 0.78rem; color: #888; }
.pdj-btn { background: #E65100; color: white; font-size: 0.78rem; font-weight: 700; padding: 8px 16px; border-radius: 6px; text-decoration: none; transition: background 0.2s; }
.pdj-btn:hover { background: #bf4400; }
</style>
