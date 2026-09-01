<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app';
import { useElus } from '~/composables/useElus';

// pages/elus.vue — Le Maire et les élus
const { maire, adjoints, pending } = useElus()

useSeoMeta({
  title: 'Le Maire et les élus',
  description: 'Découvrez le Maire de Bouaké Amadou Koné, son parcours, ses adjoints et les conseillers municipaux.',
})
</script>

<template>
  <div>

    <!-- ══ HERO MINISTÉRIEL ════════════════════════════════════ -->
    <section id="le-maire" class="page-hero">

      <!-- Photo maire pleine hauteur (fond naturel, vignette sombre) -->
      <div v-if="!pending && maire" class="hero-photo-side">
        <img :src="maire?.photo" :alt="maire?.photoAlt" />
        <div class="hero-photo-fade" />
      </div>

      <!-- Contenu gauche -->
      <div class="hero-content">

        <!-- Institution + fil d'Ariane -->
        <div class="hero-top">
          <span class="hero-institution">Mairie de Bouaké</span>
          <span class="hero-sep">—</span>
          <span class="hero-section">Le Maire et ses Adjoints</span>
        </div>

        <!-- Titre central -->
        <div class="hero-text">
          <p class="hero-overline">Gouvernance municipale</p>
          <h1 class="hero-h1">
            <span>Le Maire</span>
            <em>et ses Adjoints</em>
          </h1>
          <div v-if="!pending && maire" class="hero-identity">
            <span class="hero-identity-dot" />
            <div>
              <p class="hero-identity-name">{{ maire.firstName }} {{ maire.lastName }}</p>
              <p class="hero-identity-role">Maire de Bouaké · Depuis septembre 2023</p>
            </div>
          </div>
        </div>

        <!-- Navigation minimaliste -->
        <nav class="hero-nav">
          <a href="#le-maire" class="hero-nav-link active"><i class="fa-solid fa-user-tie" /> Maire de Bouaké</a>
          <a href="#les-adjoints" class="hero-nav-link"><i class="fa-solid fa-users" /> Adjoints au Maire</a>
          <a href="#les-conseillers" class="hero-nav-link"><i class="fa-solid fa-landmark" /> Conseillers</a>
        </nav>

      </div>
    </section>

    <!-- Chargement -->
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-success" />
    </div>

    <template v-else-if="maire">

      <!-- ══ PARCOURS & SIDEBAR ══════════════════════════════════ -->
      <section class="parcours-section">
        <div class="parcours-inner">

          <!-- Colonne gauche : Timeline -->
          <div class="parcours-left">
            <div class="parcours-head">
              <p class="parcours-overline">Biographie</p>
              <h2 class="parcours-title">Parcours Politique</h2>
            </div>

            <div class="tl">
              <div v-for="(item, i) in maire.timeline" :key="item.period" class="tl-item">
                <!-- Numéro + ligne verticale -->
                <div class="tl-axis">
                  <span class="tl-num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span class="tl-line" />
                </div>
                <!-- Contenu -->
                <div class="tl-body">
                  <p class="tl-period">{{ item.period }}</p>
                  <h3 class="tl-title">{{ item.title }}</h3>
                  <p class="tl-desc">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite : Sidebar institutionnelle -->
          <div class="parcours-right">

            <!-- Transparence -->
            <div class="inst-card">
              <div class="inst-card-header">
                <span class="inst-card-icon"><i class="fa-solid fa-shield-halved" /></span>
                <div>
                  <p class="inst-card-label">Documents officiels</p>
                  <h4 class="inst-card-title">Transparence & Patrimoine</h4>
                </div>
              </div>
              <ul class="inst-doc-list">
                <li v-for="doc in maire.documents" :key="doc.id" class="inst-doc-item">
                  <span class="inst-doc-icon"><i class="fa-solid fa-file-lines" /></span>
                  <div class="inst-doc-info">
                    <span class="inst-doc-name">{{ doc.label }}</span>
                    <a :href="doc.href" class="inst-doc-link">
                      {{ doc.linkLabel }} <i class="fa-solid fa-arrow-right" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Représentations -->
            <div class="inst-card inst-card--dark">
              <div class="inst-card-header">
                <span class="inst-card-icon inst-card-icon--light"><i class="fa-solid fa-earth-africa" /></span>
                <div>
                  <p class="inst-card-label" style="color:rgba(255,255,255,0.6)">Mandats & fonctions</p>
                  <h4 class="inst-card-title" style="color:white">Représentations Officielles</h4>
                </div>
              </div>
              <ul class="inst-rep-list">
                <li v-for="rep in maire.representations" :key="rep" class="inst-rep-item">
                  <i class="fa-solid fa-check inst-rep-check" />
                  {{ rep }}
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <!-- Adjoints -->
      <section id="les-adjoints" class="adjoints-section">
        <div class="container-wide">
          <div class="adjoints-head">
            <p class="adjoints-overline">Gouvernance municipale</p>
            <h2 class="adjoints-title">Les Adjoints au Maire</h2>
            <p class="adjoints-sub">Survolez une carte pour découvrir les attributions de chaque adjoint.</p>
          </div>
          <div class="adjoints-grid">
            <UiFlipCard
              v-for="adjoint in adjoints"
              :key="adjoint.id"
              :adjoint="adjoint"
            />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* ══ KEYFRAMES ══════════════════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(1.04); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Animations hero élus ── */
.hero-top     { animation: fadeLeft  0.6s ease both; animation-delay: 0.1s; }
.hero-flag-strip { animation: fadeLeft 0.5s ease both; animation-delay: 0.25s; }
.hero-overline { animation: fadeUp   0.6s ease both; animation-delay: 0.3s; }
.hero-h1      { animation: fadeUp   0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.45s; }
.hero-identity { animation: fadeUp  0.6s ease both; animation-delay: 0.65s; }
.hero-nav     { animation: fadeUp   0.5s ease both; animation-delay: 0.8s; }
.hero-photo-side { animation: scaleIn 1s ease both; animation-delay: 0.2s; }

/* ══ HERO UNIFIÉ ════════════════════════════════════════════════ */
.page-hero {
  position: relative;
  min-height: 520px;
  background: #E65100;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

/* Photo maire : droite, pleine hauteur */
.hero-photo-side {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 48%;
  overflow: hidden;
}
.hero-photo-side img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: top center;
}
/* Dégradé orange → transparent */
.hero-photo-fade {
  position: absolute; inset: 0;
  background: linear-gradient(
    to right,
    #E65100 0%,
    #E65100 5%,
    rgba(230, 81, 0, 0.85) 30%,
    rgba(230, 81, 0, 0.35) 55%,
    transparent 80%
  );
}

/* Contenu gauche */
.hero-content {
  position: relative; z-index: 2;
  width: 55%;
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 44px 48px 0 72px;
}

/* Institution / breadcrumb */
.hero-top {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.6rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: rgba(255,255,255,0.7);
}
.hero-institution { color: white; font-weight: 800; }
.hero-sep { color: rgba(255,255,255,0.5); }
.hero-section { color: rgba(255,255,255,0.7); }

/* Texte principal */
.hero-text {
  flex: 1;
  display: flex; flex-direction: column;
  justify-content: center;
  padding: 20px 0 28px;
}
.hero-overline {
  font-size: 0.58rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.28em;
  color: rgba(255,255,255,0.8); margin: 0 0 20px;
  display: flex; align-items: center; gap: 10px;
}
.hero-overline::before {
  content: '';
  display: inline-block;
  width: 24px; height: 1px;
  background: rgba(255,255,255,0.6);
}
.hero-h1 {
  font-size: clamp(2.8rem, 4.8vw, 4.6rem);
  font-weight: 900; color: white;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  line-height: 0.95; margin: 0 0 36px;
}
.hero-h1 span { display: block; }
.hero-h1 em {
  font-style: normal; font-weight: 200;
  color: rgba(255,255,255,0.75);
  font-size: 0.72em;
  letter-spacing: 0.05em;
  display: block; margin-top: 6px;
}

/* Identité du maire */
.hero-identity {
  display: flex; align-items: flex-start; gap: 16px;
}
.hero-identity-dot {
  width: 3px; flex-shrink: 0;
  align-self: stretch;
  background: white;
  border-radius: 2px;
  min-height: 40px;
}
.hero-identity-name {
  font-size: 0.9rem; font-weight: 800;
  color: white; text-transform: uppercase;
  letter-spacing: 0.1em; margin: 0 0 4px;
}
.hero-identity-role {
  font-size: 0.68rem; color: rgba(255,255,255,0.75);
  letter-spacing: 0.08em; margin: 0;
}

/* Navigation bas — fine, typographique */
.hero-nav {
  display: flex;
  align-items: stretch;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.hero-nav-link {
  padding: 16px 24px;
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  border-right: 1px solid rgba(255,255,255,0.2);
  transition: color 0.2s, background 0.2s;
  position: relative;
}
.hero-nav-link::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: white;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s ease;
}
.hero-nav-link:hover { color: white; background: rgba(255,255,255,0.1); }
.hero-nav-link:hover::after { transform: scaleX(1); }
.hero-nav-link.active { color: white; background: rgba(255,255,255,0.15); }
.hero-nav-link.active::after { transform: scaleX(1); }

/* ══ PARCOURS POLITIQUE ════════════════════════════════════════ */
.parcours-section {
  background: #FAFAF8;
  border-top: 1px solid #EBEBEB;
  padding: 80px 0;
}
.parcours-inner {
  max-width: 1400px; margin: 0 auto; padding: 0 72px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 80px;
  align-items: start;
}

/* Entête gauche */
.parcours-head { margin-bottom: 52px; }
.parcours-overline {
  font-size: 0.58rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.24em;
  color: #E65100; margin: 0 0 10px;
  display: flex; align-items: center; gap: 10px;
}
.parcours-overline::before {
  content: ''; display: inline-block;
  width: 20px; height: 1px; background: #E65100;
}
.parcours-title {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 900; color: #0D0D0D;
  text-transform: uppercase;
  letter-spacing: -0.02em; margin: 0; line-height: 1;
}

/* Timeline */
.tl { display: flex; flex-direction: column; gap: 0; }
.tl-item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0;
  position: relative;
}
.tl-axis {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 2px;
}
.tl-num {
  font-size: 0.58rem; font-weight: 900;
  color: #E65100; letter-spacing: 0.1em;
  background: #FFF3EE;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tl-line {
  flex: 1; width: 1px;
  background: #EBEBEB;
  margin: 6px 0;
  min-height: 32px;
}
.tl-item:last-child .tl-line { display: none; }

.tl-body {
  padding: 0 0 44px 24px;
  border-left: none;
}
.tl-period {
  font-size: 0.6rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: #009640; margin: 4px 0 10px;
}
.tl-title {
  font-size: 1.05rem; font-weight: 800;
  color: #0D0D0D; margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.tl-desc {
  font-size: 0.85rem; color: #666;
  line-height: 1.65; margin: 0;
}

/* ── Sidebar institutionnelle ── */
.inst-card {
  background: white;
  border: 1px solid #EBEBEB;
  margin-bottom: 20px;
}
.inst-card--dark { background: #009640; border-color: #009640; }

.inst-card-header {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #EBEBEB;
}
.inst-card--dark .inst-card-header { border-bottom-color: rgba(255,255,255,0.15); }

.inst-card-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: #FFF3EE;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: #E65100;
}
.inst-card-icon--light { background: rgba(255,255,255,0.08); color: white; }

.inst-card-label {
  font-size: 0.56rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: #999; margin: 0 0 3px;
}
.inst-card-title {
  font-size: 0.88rem; font-weight: 800;
  color: #0D0D0D; margin: 0;
}

/* Liste documents */
.inst-doc-list { list-style: none; padding: 0; margin: 0; }
.inst-doc-item {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid #F5F5F3;
  transition: background 0.2s;
}
.inst-doc-item:last-child { border-bottom: none; }
.inst-doc-item:hover { background: #FAFAF8; }
.inst-doc-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
.inst-doc-name {
  display: block; font-size: 0.8rem; font-weight: 600;
  color: #0D0D0D; margin-bottom: 4px;
}
.inst-doc-link {
  font-size: 0.72rem; font-weight: 700;
  color: #009640; text-decoration: none;
  display: flex; align-items: center; gap: 4px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.inst-doc-link i { font-size: 0.6rem; }

/* Liste représentations */
.inst-rep-list { list-style: none; padding: 0 24px 8px; margin: 0; }
.inst-rep-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  font-size: 0.82rem; color: rgba(255,255,255,0.75);
  line-height: 1.5;
}
.inst-rep-item:last-child { border-bottom: none; }
.inst-rep-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #E65100; flex-shrink: 0; margin-top: 7px;
}
.inst-rep-check {
  color: rgba(255,255,255,0.7); font-size: 0.7rem;
  flex-shrink: 0; margin-top: 4px;
}

/* ══ ADJOINTS ═══════════════════════════════════════════════════ */
.adjoints-section {
  padding: 80px 0;
  background: #F7F7F5;
  border-top: 1px solid #EBEBEB;
}
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 48px; }

.adjoints-head { margin-bottom: 48px; }
.adjoints-overline {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.16em; color: #E65100; margin-bottom: 8px;
}
.adjoints-title {
  font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 900;
  color: #0D0D0D; text-transform: uppercase;
  letter-spacing: -0.01em; margin: 0 0 12px; line-height: 1;
}
.adjoints-sub { font-size: 0.85rem; color: #777; margin: 0; }

.adjoints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .container-wide { padding: 0 20px; }
  .adjoints-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (max-width: 480px) {
  .adjoints-grid { grid-template-columns: 1fr; }
}
</style>
