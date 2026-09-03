<script setup lang="ts">
export interface ProjetDoc { icon: string; label: string; size: string }
export interface Projet {
  id: string
  label: string
  title: string
  image: string | null
  text: string
  status?: string
  category?: string
  dateDebut?: string | null
  dateFin?: string | null
  maitreOuvrage?: string
  bailleurs?: string
}

const props = defineProps<{ projets: Projet[] }>()
const activeId = ref(props.projets[0]?.id ?? '')
const active = computed(() => props.projets.find(p => p.id === activeId.value) ?? props.projets[0])

watch(() => props.projets, (projects) => {
  if (projects.length && !projects.some(project => project.id === activeId.value)) {
    activeId.value = projects[0].id
  }
}, { deep: true })
</script>

<template>
  <section class="s-projects">
    <div class="container-wide">
      <div class="s-section-head">
        <p class="section-overline">Investissements</p>
        <div class="section-head-row">
          <h2 class="section-title">Les Projets de la ville</h2>
          <NuxtLink to="/projets" class="section-link">Tous les projets →</NuxtLink>
        </div>
      </div>

      <div v-if="active" class="proj-layout">
        <div class="proj-tabs">
          <button v-for="p in projets" :key="p.id" class="proj-tab"
            :class="{ 'proj-tab--active': activeId === p.id }"
            @click="activeId = p.id">
            {{ p.label }}
          </button>
        </div>

        <Transition name="fade-tab" mode="out-in">
          <div :key="activeId" class="proj-content">
            <div v-if="active.image" class="proj-img-wrap">
              <img :src="active.image" :alt="active.title" class="proj-img" />
            </div>
            <div v-else class="proj-img-wrap proj-img-wrap--empty">Image à venir</div>
            <div class="proj-info">
              <h3 class="proj-title">{{ active.title }}</h3>
              <p class="proj-text">{{ active.text }}</p>
              <div class="proj-meta">
                <span v-if="active.status"><i class="bi bi-circle-fill" /> {{ active.status.replace('_', ' ') }}</span>
                <span v-if="active.category"><i class="bi bi-layers" /> {{ active.category }}</span>
                <span v-if="active.dateDebut || active.dateFin"><i class="bi bi-calendar3" /> {{ active.dateDebut || '...' }} → {{ active.dateFin || '...' }}</span>
                <span v-if="active.maitreOuvrage"><i class="bi bi-building" /> {{ active.maitreOuvrage }}</span>
                <span v-if="active.bailleurs"><i class="bi bi-bank" /> {{ active.bailleurs }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <p v-else class="proj-empty">Aucun projet à afficher.</p>
    </div>
  </section>
</template>

<style scoped>
.s-projects { background: white; padding: 80px 0; border-top: 1px solid #EBEBEB; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 48px; }
.s-section-head { margin-bottom: 40px; }
.section-overline { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #E65100; margin-bottom: 8px; }
.section-head-row { display: flex; justify-content: space-between; align-items: flex-end; }
.section-title { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 900; color: #0D0D0D; text-transform: uppercase; letter-spacing: -0.01em; margin: 0; line-height: 1; }
.section-link { font-size: 0.85rem; font-weight: 700; color: #009640; text-decoration: none; letter-spacing: 0.02em; white-space: nowrap; padding-bottom: 2px; border-bottom: 1px solid #009640; }

.proj-layout { display: grid; grid-template-columns: 260px 1fr; gap: 0; border: 1px solid #EBEBEB; }
.proj-tabs { display: flex; flex-direction: column; border-right: 1px solid #EBEBEB; }
.proj-tab {
  padding: 20px 24px; text-align: left; background: none; border: none;
  border-bottom: 1px solid #EBEBEB; font-size: 0.82rem; font-weight: 700;
  color: #555; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s;
}
.proj-tab:hover { background: #F7F7F5; color: #009640; }
.proj-tab--active { background: #009640; color: white; }
.proj-tab--active:hover { background: #007a33; color: white; }

.proj-content { display: grid; grid-template-columns: 1fr 1fr; }
.proj-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  align-self: start;
  overflow: hidden;
}
.proj-img-wrap--empty { display: flex; align-items: center; justify-content: center; background: #F2F1EC; color: #777; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }
.proj-img { display: block; width: 100%; height: 100%; object-fit: cover; }
.proj-info { padding: 40px; }
.proj-title { font-size: 1.4rem; font-weight: 900; color: #0D0D0D; text-transform: uppercase; margin: 0 0 16px; }
.proj-text { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 24px; }
.proj-meta { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 18px; border-top: 1px solid #EBEBEB; color: #555; font-size: 0.72rem; }
.proj-meta span { padding: 6px 9px; background: #F7F7F5; }
.proj-meta i { color: #009640; margin-right: 4px; }
.proj-docs { border-top: 1px solid #EBEBEB; padding-top: 20px; }
.proj-docs__label { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: #009640; margin-bottom: 10px; }
.proj-doc { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #EBEBEB; margin-bottom: 6px; font-size: 0.82rem; font-weight: 700; color: #0D0D0D; text-decoration: none; transition: background 0.2s; }
.proj-doc:hover { background: #F7F7F5; color: #E65100; }
.proj-doc__size { margin-left: auto; font-size: 0.7rem; color: #999; font-weight: 400; }

.fade-tab-enter-active, .fade-tab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-tab-enter-from, .fade-tab-leave-to { opacity: 0; transform: translateY(6px); }

@media (max-width: 768px) {
  .container-wide { padding: 0 20px; }
  .proj-layout { grid-template-columns: 1fr; }
  .proj-tabs { flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid #EBEBEB; }
  .proj-content { grid-template-columns: 1fr; }
}
</style>
