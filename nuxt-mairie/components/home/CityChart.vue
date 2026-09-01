<script setup lang="ts">
// components/home/CityChart.vue — Graphique SVG interactif de la ville
const hoveredLabel = ref<string | null>(null)

const slices = [
  { id: 'education', label: 'Éducation', color: '#009640', d: 'M 200 200 L 200 50 A 150 150 0 0 1 330 125 Z' },
  { id: 'sante', label: 'Santé', color: '#4caf50', d: 'M 200 200 L 330 125 A 150 150 0 0 1 350 200 Z' },
  { id: 'voirie', label: 'Voirie', color: '#e65100', d: 'M 200 200 L 350 200 A 150 150 0 0 1 300 310 Z' },
  { id: 'commerce', label: 'Commerce', color: '#ff7043', d: 'M 200 200 L 300 310 A 150 150 0 0 1 100 310 Z' },
  { id: 'social', label: 'Social', color: '#1565c0', d: 'M 200 200 L 100 310 A 150 150 0 0 1 50 200 Z' },
  { id: 'numerique', label: 'Numérique', color: '#1e88e5', d: 'M 200 200 L 50 200 A 150 150 0 0 1 200 50 Z' },
]
</script>

<template>
  <div class="city-chart">
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Secteurs d'activité de la commune">
      <!-- Slices -->
      <g
        v-for="slice in slices"
        :key="slice.id"
        class="slice-group"
        :data-label="slice.label"
        role="img"
        :aria-label="slice.label"
        @mouseenter="hoveredLabel = slice.label"
        @mouseleave="hoveredLabel = null"
      >
        <path
          :d="slice.d"
          :fill="slice.color"
          :opacity="hoveredLabel && hoveredLabel !== slice.label ? 0.5 : 1"
          class="slice-path"
        />
      </g>

      <!-- Cercle central -->
      <circle
        id="centerCircle"
        cx="200"
        cy="200"
        r="60"
        fill="white"
        :class="{ 'is-hovered': hoveredLabel }"
      />
      <text
        id="centerText"
        x="200"
        y="205"
        text-anchor="middle"
        dominant-baseline="middle"
        class="center-text"
      >
        {{ hoveredLabel ?? 'Bouaké' }}
      </text>
    </svg>

    <!-- Légende -->
    <div class="chart-legend">
      <div
        v-for="slice in slices"
        :key="slice.id"
        class="legend-item"
        :class="{ 'legend-item--active': hoveredLabel === slice.label }"
        @mouseenter="hoveredLabel = slice.label"
        @mouseleave="hoveredLabel = null"
      >
        <span class="legend-dot" :style="{ backgroundColor: slice.color }" />
        <span>{{ slice.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.city-chart { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.slice-path {
  cursor: pointer;
  transition: opacity 0.25s, transform 0.25s;
  transform-origin: center;
}
.slice-group:hover .slice-path { filter: brightness(1.1); }

#centerCircle {
  transition: r 0.25s;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
}
#centerCircle.is-hovered { r: 65; }

.center-text {
  font-size: 14px;
  font-weight: 700;
  fill: #333;
  pointer-events: none;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.legend-item--active { font-weight: 700; }

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
