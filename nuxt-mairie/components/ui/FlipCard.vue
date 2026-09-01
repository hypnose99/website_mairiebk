<script setup lang="ts">
import type { Adjoint } from '~/types'

defineProps<{ adjoint: Adjoint }>()

const ordinal = (rank: number) => {
  if (rank === 1) return '1er'
  return `${rank}ème`
}
</script>

<template>
  <div class="fc-wrap">
    <div class="fc-inner">

      <!-- ── FACE AVANT ── -->
      <div class="fc-front">
        <div class="fc-img-wrap">
          <img :src="adjoint.photo" :alt="`${adjoint.firstName} ${adjoint.lastName}`" loading="lazy" />
          <!-- Badge rang -->
          <span class="fc-rank-badge">{{ ordinal(adjoint.rank) }}</span>
          <!-- Gradient info overlay -->
          <div class="fc-overlay">
            <p class="fc-title-label">Adjoint au Maire</p>
            <p class="fc-name">{{ adjoint.firstName }} {{ adjoint.lastName }}</p>
          </div>
        </div>
        <!-- Hint -->
        <div class="fc-hint">
          <span>Voir les attributions</span>
          <i class="bi bi-arrow-right-circle" />
        </div>
      </div>

      <!-- ── FACE ARRIÈRE ── -->
      <div class="fc-back">
        <!-- Numéro décoratif en fond -->
        <span class="fc-bg-number">{{ adjoint.rank }}</span>
        <div class="fc-back-content">
          <p class="fc-back-label">{{ ordinal(adjoint.rank) }} Adjoint au Maire</p>
          <p class="fc-back-name">{{ adjoint.firstName }}<br />{{ adjoint.lastName }}</p>
          <div class="fc-divider" />
          <p class="fc-attr-title">SES ATTRIBUTIONS</p>
          <ul class="fc-attr-list">
            <li v-for="attr in adjoint.attributions" :key="attr">
              <i class="bi bi-chevron-right" />{{ attr }}
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Conteneur flip ── */
.fc-wrap {
  perspective: 1200px;
  height: 400px;
  cursor: pointer;
}
.fc-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}
.fc-wrap:hover .fc-inner { transform: rotateY(180deg); }

/* ── Faces communes ── */
.fc-front, .fc-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  overflow: hidden;
}

/* ── FACE AVANT ── */
.fc-front {
  background: #111;
  display: flex;
  flex-direction: column;
}
.fc-img-wrap {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.fc-img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: top center;
  transition: transform 0.5s ease;
}
.fc-wrap:hover .fc-img-wrap img { transform: scale(1.05); }

/* Badge rang (coin haut gauche) */
.fc-rank-badge {
  position: absolute; top: 14px; left: 0;
  background: #E65100; color: white;
  font-size: 0.6rem; font-weight: 900;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 5px 14px 5px 12px;
  clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
}

/* Gradient overlay bas */
.fc-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  padding: 32px 18px 14px;
}
.fc-title-label {
  font-size: 0.6rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.14em;
  color: #E65100; margin: 0 0 4px;
}
.fc-name {
  font-size: 1rem; font-weight: 900;
  color: white; margin: 0;
  text-transform: uppercase; letter-spacing: 0.04em;
  line-height: 1.2;
}

/* Hint bande bas */
.fc-hint {
  background: #009640; color: white;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  transition: background 0.2s;
}
.fc-wrap:hover .fc-hint { background: #007a32; }
.fc-hint i { font-size: 1rem; }

/* ── FACE ARRIÈRE ── */
.fc-back {
  background: linear-gradient(160deg, #004d20 0%, #009640 60%, #00b84a 100%);
  transform: rotateY(180deg);
  position: relative;
}

/* Numéro décoratif */
.fc-bg-number {
  position: absolute; right: -10px; bottom: -20px;
  font-size: 9rem; font-weight: 900;
  color: rgba(255,255,255,0.06);
  line-height: 1; pointer-events: none;
  user-select: none;
}

.fc-back-content {
  position: relative; z-index: 1;
  padding: 24px 20px;
  height: 100%;
  display: flex; flex-direction: column;
}
.fc-back-label {
  font-size: 0.58rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: rgba(255,255,255,0.6); margin: 0 0 4px;
}
.fc-back-name {
  font-size: 1.1rem; font-weight: 900;
  color: white; margin: 0;
  text-transform: uppercase; letter-spacing: 0.04em;
  line-height: 1.15;
}
.fc-divider {
  width: 32px; height: 2px;
  background: #E65100;
  margin: 12px 0;
}
.fc-attr-title {
  font-size: 0.58rem; font-weight: 900;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: rgba(255,255,255,0.5); margin: 0 0 10px;
}
.fc-attr-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 5px;
  overflow: hidden;
}
.fc-attr-list li {
  font-size: 0.78rem; color: rgba(255,255,255,0.9);
  display: flex; align-items: baseline; gap: 6px;
  line-height: 1.3;
}
.fc-attr-list li i {
  font-size: 0.55rem; color: #E65100;
  flex-shrink: 0; margin-top: 2px;
}
</style>
