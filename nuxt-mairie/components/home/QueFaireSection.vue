<script setup lang="ts">
export interface Lieu {
  id: number
  badge: string
  image: string
  name: string
  quartier: string
  tel?: string
  description?: string
  href?: string
}

export interface QueFaireTab {
  id: string
  label: string
  lieux: Lieu[]
}

const props = defineProps<{ tabs: QueFaireTab[] }>()
const activeId = ref(props.tabs[0]?.id ?? '')
const activeTab = computed(() => props.tabs.find(t => t.id === activeId.value))
</script>

<template>
  <section class="s-discover">
    <div class="container-wide">
      <div class="s-section-head">
        <p class="section-overline">Tourisme & Loisirs</p>
        <h2 class="section-title">Que faire à Bouaké ?</h2>
      </div>

      <div class="disc-tabs">
        <button v-for="tab in tabs" :key="tab.id" class="disc-pill"
          :class="{ 'disc-pill--active': activeId === tab.id }"
          @click="activeId = tab.id">
          {{ tab.label }}
        </button>
      </div>

      <Transition name="fade-tab" mode="out-in">
        <div :key="activeId">
          <div v-if="activeTab?.lieux.length" class="place-grid">
            <div v-for="lieu in activeTab.lieux" :key="lieu.id" class="place-card">
              <div class="place-img">
                <img :src="lieu.image" :alt="lieu.name" />
              </div>
              <div class="place-body">
                <h4 class="place-name">{{ lieu.name }}</h4>
                <p class="place-info">📍 {{ lieu.quartier }}</p>
                <p v-if="lieu.tel" class="place-info">📞 {{ lieu.tel }}</p>
                <p v-if="lieu.description" class="place-info">{{ lieu.description }}</p>
              </div>
            </div>
          </div>
          <div v-else class="disc-empty"><p>Contenu à venir.</p></div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.s-discover { background: #F7F7F5; padding: 80px 0; border-top: 1px solid #EBEBEB; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 48px; }
.s-section-head { margin-bottom: 40px; }
.section-overline { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #E65100; margin-bottom: 8px; }
.section-title { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 900; color: #0D0D0D; text-transform: uppercase; letter-spacing: -0.01em; margin: 0; line-height: 1; }

.disc-tabs { display: flex; gap: 0; margin-bottom: 32px; border: 1px solid #EBEBEB; width: fit-content; }
.disc-pill {
  padding: 12px 24px; background: white; border: none;
  border-right: 1px solid #EBEBEB; font-size: 0.78rem; font-weight: 700;
  color: #555; text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s;
}
.disc-pill:last-child { border-right: none; }
.disc-pill:hover { color: #009640; }
.disc-pill--active { background: #009640; color: white; }
.disc-pill--active:hover { color: white; }

.place-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #EBEBEB; }
.place-card { background: white; display: flex; flex-direction: column; }
.place-img { height: 200px; overflow: hidden; position: relative; flex-shrink: 0; display: block; }
.place-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; display: block; }
.place-card:hover .place-img img { transform: scale(1.05); }
.place-body { padding: 20px; flex: 1; }
.place-name { font-size: 0.95rem; font-weight: 700; color: #0D0D0D; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.02em; }
.place-info { font-size: 0.8rem; color: #555; margin: 4px 0; }
.disc-empty { padding: 60px; text-align: center; color: #999; background: white; font-size: 0.9rem; border: 1px solid #EBEBEB; }

.fade-tab-enter-active, .fade-tab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-tab-enter-from, .fade-tab-leave-to { opacity: 0; transform: translateY(6px); }

@media (max-width: 1100px) { .place-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .container-wide { padding: 0 20px; } .disc-tabs { flex-wrap: wrap; } }
</style>
