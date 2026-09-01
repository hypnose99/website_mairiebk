<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const flashes = [
  { cat: 'TRAVAUX', msg: 'Fermeture temporaire de l\'avenue principale pour rénovation ce mardi 01 juil.', href: '/actualites/travaux' },
  { cat: 'SANTÉ', msg: 'Campagne de vaccination gratuite au centre hospitalier régional de Bouaké.', href: '/actualites/vaccination' },
  { cat: 'ÉTAT CIVIL', msg: 'Nouveaux horaires des guichets : 07h30 – 16h30 du lundi au vendredi.', href: '/actualites/horaires' },
  { cat: 'SÉCURITÉ', msg: 'Opération de sécurisation du marché central ce week-end. Circulation perturbée.', href: '/actualites/securite' },
]

const idx = ref(0)
const fl = computed(() => flashes[idx.value])

function prev() { idx.value = (idx.value - 1 + flashes.length) % flashes.length }
function next() { idx.value = (idx.value + 1) % flashes.length }

let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(next, 3000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="side-block">
    <p class="block-label">Flash Info</p>
    <div class="vue-carousel">

      <!-- Flash courant avec transition -->
      <div class="flash-stage">
        <Transition name="flash-slide" mode="out-in">
          <div :key="idx" class="flash-item">
            <span class="flash-dot" />
            <div class="flash-content">
              <p class="flash-cat">{{ fl.cat }}</p>
              <p class="flash-msg">{{ fl.msg }}</p>
              <a :href="fl.href" class="flash-link">Lire →</a>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Contrôles -->
      <div class="vc-controls">
        <button class="vc-btn" type="button" @click="prev">‹</button>
        <div class="vc-dots">
          <button
            v-for="(_, i) in flashes"
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
.side-block { padding: 32px 16px 32px 28px; }
.block-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.16em; color: #009640; margin-bottom: 20px;
}
.vue-carousel { display: flex; flex-direction: column; gap: 12px; }

.flash-item {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px 16px; background: white;
  border: 1px solid #EBEBEB; border-left: 4px solid #E65100; min-height: 100px;
}
.flash-dot {
  width: 9px; height: 9px; border-radius: 50%; background: red;
  flex-shrink: 0; margin-top: 3px; animation: blink 1.5s infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
.flash-content { flex: 1; }
.flash-cat { font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em; color: #E65100; margin: 0 0 6px; }
.flash-msg { font-size: 0.85rem; color: #555; line-height: 1.5; margin: 0 0 10px; }
.flash-link { font-size: 0.74rem; font-weight: 700; color: #009640; text-decoration: none; text-transform: uppercase; }

/* ── Transition flash info (slide vertical) ── */
.flash-stage { overflow: hidden; }
.flash-slide-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.flash-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  /* PAS de position:absolute → hauteur maintenue pendant la sortie */
}
.flash-slide-enter-from { opacity: 0; transform: translateY(16px); }
.flash-slide-leave-to   { opacity: 0; transform: translateY(-16px); }

.vc-controls {
  display: flex; flex-direction: row;
  align-items: center; justify-content: space-between;
}
.vc-btn {
  width: 28px; height: 28px; background: #E65100; color: white;
  border: none; cursor: pointer; font-size: 1.2rem; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.2s;
}
.vc-btn:hover { background: #bf360c; }
.vc-dots { display: flex; flex-direction: row; gap: 8px; align-items: center; }
.vc-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #EBEBEB; border: none; cursor: pointer;
  padding: 0; transition: background 0.2s, transform 0.2s;
}
.vc-dot--active { background: #E65100; transform: scale(1.4); }
</style>
