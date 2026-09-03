<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface Evenement {
  id: string
  titre: string
  dateBadge: string
  heure: string
  lieu: string
  image: string | null
  coverImage: string | null
  href: string
}

const props = defineProps<{ events: Evenement[]; pending?: boolean }>()
const emit = defineEmits<{ open: [event: Evenement] }>()

const idx = ref(0)
const ev  = computed(() => props.events[idx.value])

function prev() {
  if (props.events.length > 1) idx.value = (idx.value - 1 + props.events.length) % props.events.length
}
function next() {
  if (props.events.length > 1) idx.value = (idx.value + 1) % props.events.length
}

watch(() => props.events.length, (length) => {
  if (length === 0) idx.value = 0
  else if (idx.value >= length) idx.value = 0
})

let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(next, 4000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="side-block">
    <p class="block-label">Événements à venir</p>

    <div v-if="pending && events.length === 0" class="ev-skeleton" role="status" aria-live="polite">
      <div class="ev-skeleton__img" />
      <div class="ev-skeleton__body">
        <div class="ev-skeleton__line ev-skeleton__line--title" />
        <div class="ev-skeleton__line ev-skeleton__line--short" />
      </div>
    </div>

    <div v-else-if="events.length === 0" class="ev-empty">
      Aucun événement à venir.
    </div>

    <div v-else class="vue-carousel">
      <div class="vc-stage-wrap">
        <Transition name="ev-slide" mode="out-in">
          <div :key="idx" class="ev-card cursor-pointer" role="button" tabindex="0" @click="emit('open', ev)" @keydown.enter="emit('open', ev)">
            <div class="ev-img-wrap">
              <img v-if="ev.image" :src="ev.image" :alt="ev.titre" class="ev-img" />
              <span class="ev-badge">{{ ev.dateBadge }}</span>
            </div>
            <div class="ev-body">
              <p class="ev-title">{{ ev.titre }}</p>
              <div class="ev-meta">
                <span v-if="ev.heure"><i class="bi bi-clock" /> {{ ev.heure }}</span>
                <span v-if="ev.lieu"><i class="bi bi-geo-alt" /> {{ ev.lieu }}</span>
              </div>
              <NuxtLink :to="ev.href" class="ev-link" @click.stop> Détails →</NuxtLink>
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

/* ── Skeleton (chargement lazy) ─────────────────────────────────────── */
.ev-skeleton { background: white; border: 1px solid #EBEBEB; }
.ev-skeleton__img,
.ev-skeleton__line {
  background: linear-gradient(90deg, #EBEBEB 25%, #F7F7F5 50%, #EBEBEB 75%);
  background-size: 200% 100%;
  animation: ev-shimmer 1.2s infinite;
}
.ev-skeleton__img { height: 175px; }
.ev-skeleton__body { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.ev-skeleton__line { height: 12px; border-radius: 4px; }
.ev-skeleton__line--title { width: 70%; height: 16px; }
.ev-skeleton__line--short { width: 45%; }
@keyframes ev-shimmer { to { background-position: -200% 0; } }
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
.ev-meta { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; color: #777; font-size: 0.78rem; }
.ev-meta i { color: #009640; margin-right: 5px; }
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
