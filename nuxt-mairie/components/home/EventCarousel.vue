<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface Evenement {
  id: string
  titre: string
  description: string
  dateBadge: string
  coverImage: string | null
  href: string
}

const props = defineProps<{ events: Evenement[] }>()

const idx = ref(0)
const ev  = computed(() => props.events[idx.value])

function prev() { idx.value = (idx.value - 1 + props.events.length) % props.events.length }
function next() { idx.value = (idx.value + 1) % props.events.length }

let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(next, 4000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="side-block">
    <p class="block-label">Événements à venir</p>

    <div v-if="events.length === 0" class="ev-empty">
      Aucun événement à venir.
    </div>

    <div v-else class="vue-carousel">
      <div class="vc-stage-wrap">
        <Transition name="ev-slide" mode="out-in">
          <div :key="idx" class="ev-card">
            <div class="ev-img-wrap">
              <img
                :src="ev.coverImage ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80'"
                :alt="ev.titre"
                class="ev-img"
              />
              <span class="ev-badge">{{ ev.dateBadge }}</span>
            </div>
            <div class="ev-body">
              <p class="ev-title">{{ ev.titre }}</p>
              <p class="ev-sub">{{ ev.description }}</p>
              <a :href="ev.href" class="ev-link">Détails →</a>
            </div>
          </div>
        </Transition>
      </div>

      <div class="vc-controls">
        <button class="vc-btn" type="button" @click="prev">‹</button>
        <div class="vc-dots">
          <button
            v-for="(_, i) in events"
            :key="i"
            class="vc-dot"
            :class="{ 'vc-dot--active': i === idx }"
            type="button"
            @click="idx = i"
          />
        </div>
        <button class="vc-btn" type="button" @click="next">›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-block { padding: 32px 28px; }
.side-block:not(:last-child) { border-bottom: 1px solid #EBEBEB; }
.block-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.16em; color: #009640; margin-bottom: 20px;
}
.ev-empty { font-size: 0.85rem; color: #999; padding: 20px 0; }
.vue-carousel { display: flex; flex-direction: column; gap: 12px; }
.vc-stage-wrap { position: relative; overflow: hidden; min-height: 255px; }

.ev-card { background: white; border: 1px solid #EBEBEB; }
.ev-img-wrap { position: relative; height: 175px; overflow: hidden; }
.ev-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.ev-card:hover .ev-img { transform: scale(1.04); }
.ev-badge {
  position: absolute; top: 12px; left: 12px;
  background: #E65100; color: white; font-size: 0.7rem; font-weight: 900;
  padding: 6px 12px; text-transform: uppercase; letter-spacing: 0.08em;
}
.ev-body { padding: 20px; }
.ev-title { font-size: 1.05rem; font-weight: 700; color: #0D0D0D; margin: 0 0 6px; text-transform: uppercase; }
.ev-sub { font-size: 0.88rem; color: #555; margin: 0 0 14px; line-height: 1.5; }
.ev-link { font-size: 0.8rem; font-weight: 700; color: #009640; text-decoration: none; text-transform: uppercase; }

.vc-controls { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
.vc-btn {
  width: 32px; height: 32px; background: #009640; color: white;
  border: none; cursor: pointer; font-size: 1.4rem; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.2s;
}
.vc-btn:hover { background: #007a33; }
.vc-dots { display: flex; flex-direction: row; gap: 8px; align-items: center; }
.vc-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #EBEBEB; border: none; cursor: pointer;
  padding: 0; transition: background 0.2s, transform 0.2s;
}
.vc-dot--active { background: #009640; transform: scale(1.4); }

.ev-slide-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.ev-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ev-slide-enter-from { opacity: 0; transform: translateX(32px); }
.ev-slide-leave-to   { opacity: 0; transform: translateX(-32px); }
</style>
