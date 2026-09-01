<script setup lang="ts">
// components/ui/ServiceAccordion.vue
import type { Demarche } from '~/types'

defineProps<{ demarches: Demarche[] }>()

const openId = ref<string | null>('mariage') // Ouvert par défaut

const toggle = (id: string) => {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div class="custom-accordion">
    <div
      v-for="d in demarches"
      :key="d.id"
      class="accordion-item"
    >
      <h2 class="accordion-header">
        <button
          class="accordion-button"
          :class="{ collapsed: openId !== d.id }"
          :aria-expanded="openId === d.id"
          @click="toggle(d.id)"
        >
          {{ d.title }}
          <span v-if="d.delay" class="acc-delay-badge">{{ d.delay }}</span>
        </button>
      </h2>

      <Transition name="accordion">
        <div v-if="openId === d.id" class="accordion-collapse">
          <div class="accordion-body">
            <p>{{ d.description }}</p>
            <div class="docs-list">
              <strong>Pièces à fournir :</strong>
              <ul class="mt-2 mb-0">
                <li v-for="doc in d.documents" :key="doc">{{ doc }}</li>
              </ul>
            </div>
            <p v-if="d.note" class="mt-3 mb-0">
              <em>{{ d.note }}</em>
            </p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.accordion-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
}

.acc-delay-badge {
  background: var(--primary-orange);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
  margin-left: 10px;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
