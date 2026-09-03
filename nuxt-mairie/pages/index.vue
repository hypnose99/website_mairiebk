<script setup lang="ts">
useSeoMeta({
  title: 'Accueil',
  description: 'Site officiel de la Mairie de Bouaké, capitale économique du centre de la Côte d\'Ivoire.',
})

// ── Articles depuis Strapi ─────────────────────────────────────────────────
const { d } = useI18n()

const getArticleDate = (article: any) => article.date_publication || article.publishedAt

const { data: actualitesData } = useFetch('/api/actualites', {
  query: { perPage: 8 },
  key: 'home-actualites',
  lazy: true,
})

const articles = computed(() =>
  (actualitesData.value?.items ?? []).map((a: any) => ({
    id:            a.id,
    coverImage:    a.coverImage ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80',
    coverImageAlt: a.coverImageAlt ?? a.title,
    category:      a.categoryLabel,
    date:          d(new Date(getArticleDate(a)), 'short'),
    title:         a.title,
    href:          `/actualites/${a.slug}`,
  }))
)

// Article à la une (premier featured)
const { data: featuredData } = useFetch('/api/actualites', {
  query: { perPage: 1 },
  key: 'home-featured',
  lazy: true,
})
const featuredArticle = computed(() => featuredData.value?.items?.[0])
const postDuJour = computed(() => featuredArticle.value ? {
  category: featuredArticle.value.categoryLabel,
  date:     d(new Date(getArticleDate(featuredArticle.value)), 'long'),
  title:    featuredArticle.value.title,
  excerpt:  featuredArticle.value.excerpt,
  img:      featuredArticle.value.coverImage ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
  href:     `/actualites/${featuredArticle.value.slug}`,
  author:   featuredArticle.value.author,
  readTime: '3 min',
} : {
  category: 'À la une', date: '',
  title: 'Bouaké lance son programme de rénovation urbaine 2026–2030',
  excerpt: 'Le maire de Bouaké a officiellement lancé ce matin le grand programme de rénovation urbaine.',
  img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
  href: '/actualites', author: 'Service Communication', readTime: '3 min',
})

// ── Flash infos depuis Strapi ──────────────────────────────────────────────
const { data: flashData } = useFetch('/api/flash-info', { key: 'home-flash', lazy: true })
const flashes = computed(() =>
  (flashData.value ?? []).length > 0
    ? (flashData.value ?? []).map((f: any) => ({ cat: f.type.toUpperCase(), msg: f.contenu }))
    : [
        { cat: 'INFO', msg: 'Bienvenue sur le site officiel de la Mairie de Bouaké.' },
      ]
)

// ── Événements depuis Strapi ───────────────────────────────────────
const { data: evenementsData } = useFetch('/api/evenements', {
  query: { perPage: 6 },
  key: 'home-evenements',
  lazy: true,
})
const events = computed(() => evenementsData.value ?? [])

const projets = [
  { id: 'grand-marche', label: 'Grand Marché de Bouaké', title: 'Grand Marché de Bouaké', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', text: 'Le Grand Marché de Bouaké est le poumon économique de la ville. La reconstruction en cours vise à en faire le plus grand marché de gros et de détail d\'Afrique de l\'Ouest, entièrement sécurisé et doté d\'une zone logistique moderne.', docs: [{ icon: '📄', label: 'Formulaire de demande d\'acte', size: 'PDF – 1.2 Mo' }, { icon: '📋', label: 'Liste des pièces à fournir', size: 'PDF – 0.5 Mo' }] },
  { id: 'gare-routiere', label: 'Gare Routière', title: 'Gare Routière de Bouaké', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', text: 'La nouvelle gare routière regroupera tous les transports interurbains dans un espace moderne et sécurisé.', docs: [] },
  { id: 'mobilite', label: 'Mobilité urbaine', title: 'Mobilité urbaine à Bouaké', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', text: 'Un réseau de transport en commun moderne pour desservir tous les quartiers de la ville.', docs: [] },
  { id: 'sante', label: 'Santé', title: 'Infrastructures Sanitaires', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80', text: 'Construction de nouvelles infrastructures sanitaires et équipement des centres de santé existants.', docs: [] },
  { id: 'taxes', label: 'Digitalisation des Taxes', title: 'Digitalisation des Taxes', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80', text: 'Paiement en ligne des taxes locales et accompagnement à la création d\'entreprise à Bouaké.', docs: [{ icon: '🏪', label: 'Barème des taxes locales 2024', size: 'PDF – 3.0 Mo' }] },
]

const queFaireTabs = [
  { id: 'hotels', label: '🏨 Hôtels', lieux: [
    { id: 1, badge: 'Luxe',     image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', name: 'Hôtel Mon Afrik',   quartier: 'Quartier Kennedy', tel: '07 07 00 00 01' },
    { id: 2, badge: 'Confort',  image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80', name: 'Ranhôtel Bouaké',  quartier: 'Centre Ville',     tel: '01 02 03 04 05' },
    { id: 3, badge: 'Éco',      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', name: 'Hôtel du Stade',  quartier: 'Air France 1',     tel: '05 05 05 05 05' },
    { id: 4, badge: 'Business', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80', name: 'Résidence Haman', quartier: 'N\'Gattakro',       tel: '07 48 52 63 96' },
  ]},
  { id: 'restos',   label: '🍽 Restos',   lieux: [] },
  { id: 'bars',     label: '🍹 Bars',     lieux: [] },
  { id: 'tourisme', label: '📸 Tourisme', lieux: [] },
  { id: 'sport',    label: '⚽ Sport',    lieux: [] },
]

const investCards = [
  { num: '01', title: 'Investir à Bouaké', text: 'Guide de l\'investisseur, zones industrielles et fiscalité locale.' },
  { num: '02', title: 'Entrepreneuriat', text: 'Incubateurs, pépinières d\'entreprises et aides à la création.' },
  { num: '03', title: 'Immobilier', text: 'Permis de construire, foncier disponible et projets d\'urbanisme.' },
  { num: '04', title: 'Commerce', text: 'Marchés, occupation du domaine public et réglementation.' },
  { num: '05', title: 'Emploi & Stages', text: 'Offres d\'emploi de la mairie et concours administratifs.' },
  { num: '06', title: 'Étudier', text: 'Universités, grandes écoles, logements étudiants et bourses.' },
  { num: '07', title: 'Mobilité & Transport', text: 'Réseau de bus, taxis communaux et projets de voirie.' },
  { num: '08', title: 'Solidarité & Social', text: 'Aides aux familles, soutien aux associations et inclusion.' },
]
</script>

<template>
  <div class="page-home">

    <!-- ══════════════════════════════════════════════════════
         HERO
    ══════════════════════════════════════════════════════ -->
    <section class="s-hero">
      <div class="s-hero__flagline" aria-hidden="true" />
      <div class="s-hero__inner">
        <div class="s-hero__grid">

          <div class="s-hero__text">
            <p class="s-hero__overline">
              <span class="flag-chip" aria-hidden="true">
                <i class="fc fc--orange" /><i class="fc fc--white" /><i class="fc fc--green" />
              </span>
              République de Côte d'Ivoire · Commune de Bouaké
            </p>
            <h1 class="s-hero__title">Mairie<br><span class="t-green">de Bouaké</span></h1>
            <p class="s-hero__devise">« De nombreux peuples, une seule cité »</p>
            <p class="s-hero__sub">Capitale économique du Centre · Au cœur de l'Afrique de l'Ouest</p>
            <div class="s-hero__ctas">
              <NuxtLink to="/services" class="btn-primary">Mes démarches</NuxtLink>
              <NuxtLink to="/actualites" class="btn-outline-ink">Actualités</NuxtLink>
            </div>
          </div>

          <div class="s-hero__emblem" aria-hidden="true">
            <img
              src="/images/tabouretakan.png"
              alt="Tabouret akan, symbole du pouvoir traditionnel"
              class="s-hero__tabouret"
            />
            <p class="s-hero__plaque-caption">Tabouret akan · Symbole du pouvoir et de l'unité</p>
          </div>

        </div>
      </div>
    </section><!-- /s-hero -->

    <!-- ══════════════════════════════════════════════════════
         SERVICES RAPIDES
    ══════════════════════════════════════════════════════ -->
    <nav class="s-quicknav">
      <div class="s-quicknav__inner">
        <NuxtLink to="/services" class="qnav-item">
          <i class="bi bi-people-fill qnav-icon" />
          <span>Services aux citoyens</span>
        </NuxtLink>
        <NuxtLink to="/projets" class="qnav-item">
          <i class="bi bi-kanban-fill qnav-icon" />
          <span>Actions et projets</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-building-fill qnav-icon" />
          <span>Assemblée citoyenne</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-globe qnav-icon" />
          <span>Coopération décentralisée</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-briefcase-fill qnav-icon" />
          <span>Offres d'emploi</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-heart-fill qnav-icon" />
          <span>Aides sociales</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-handshake qnav-icon" />
          <span>Partenariats</span>
        </NuxtLink>
        <NuxtLink to="#" class="qnav-item">
          <i class="bi bi-house-fill qnav-icon" />
          <span>Cadre de vie</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- ══════════════════════════════════════════════════════
         BLOC PRINCIPAL : ÉVÉNEMENTS + SVG + MENU
    ══════════════════════════════════════════════════════ -->
    <section class="s-main">
      <div class="s-main__inner">

        <!-- Colonne gauche : événements -->
        <div class="col-side">
          <HomeEventCarousel :events="events" />
        </div>

        <!-- Colonne centrale : Post du jour -->
        <div class="col-center-anim">
          <HomePostDuJour :post="postDuJour" />
        </div>

        <!-- Colonne droite : Flash Info + Formulaire citoyen -->
        <div class="col-form">
          <HomeFlashInfo :flashes="flashes" />
          <HomeCitoyenForm />
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         MOT DU MAIRE
    ══════════════════════════════════════════════════════ -->
    <section class="s-mayor">
      <div class="s-mayor__inner">
        <div class="mayor-img-col">
          <img :src="'/images/amadou-kone.jpg'" alt="Amadou Koné, Maire de Bouaké" class="mayor-photo" />
        </div>
        <div class="mayor-text-col">
          <p class="section-overline">Le Mot du Maire</p>
          <h2 class="mayor-heading">Ensemble,<br>bâtissons Bouaké.</h2>
          <blockquote class="mayor-quote">
            "Chères concitoyennes, chers concitoyens, bienvenue sur le portail de notre belle cité. Bouaké se transforme jour après jour grâce à notre engagement commun. Ensemble, nous bâtissons une ville plus moderne, plus solidaire et résolument tournée vers l'avenir."
          </blockquote>
          <div class="mayor-sig">
            <p class="mayor-sig__name">Amadou Koné</p>
            <p class="mayor-sig__title">Maire de la commune de Bouaké</p>
          </div>
          <NuxtLink to="/elus" class="btn-primary">Découvrir le conseil municipal</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         ACTUALITÉS RÉCENTES
    ══════════════════════════════════════════════════════ -->
    <HomeActualitesSection :articles="articles" />

    <!-- ══════════════════════════════════════════════════════
         PROJETS DE LA VILLE
    ══════════════════════════════════════════════════════ -->
    <HomeProjetsSection :projets="projets" />

    <!-- ══════════════════════════════════════════════════════
         QUE FAIRE À BOUAKÉ ?
    ══════════════════════════════════════════════════════ -->
    <HomeQueFaireSection :tabs="queFaireTabs" />

    <!-- ══════════════════════════════════════════════════════
         OPPORTUNITÉS & DÉVELOPPEMENT
    ══════════════════════════════════════════════════════ -->
    <section class="s-invest">
      <div class="container-wide">
        <div class="s-section-head">
          <p class="section-overline">Croissance & Attractivité</p>
          <h2 class="section-title">Opportunités & Développement</h2>
        </div>
        <div class="invest-grid">
          <div v-for="card in investCards" :key="card.num" class="inv-card">
            <span class="inv-num">{{ card.num }}</span>
            <h4 class="inv-title">{{ card.title }}</h4>
            <p class="inv-text">{{ card.text }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ══ KEYFRAMES ══════════════════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideNavItem {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Hero animations ── */
.s-hero__overline { animation: fadeUp 0.6s ease both; animation-delay: 0.1s; }
.s-hero__title    { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.25s; }
.s-hero__devise   { animation: fadeUp 0.6s ease both; animation-delay: 0.4s; }
.s-hero__sub      { animation: fadeUp 0.6s ease both; animation-delay: 0.5s; }
.s-hero__ctas     { animation: fadeUp 0.6s ease both; animation-delay: 0.65s; }
.s-hero__emblem   { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.45s; }

/* ── Quick nav ── */
.s-quicknav { animation: fadeIn 0.5s ease both; animation-delay: 0.9s; }

/* ── Bloc principal 3 colonnes ── */
.col-side          { animation: fadeLeft  0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 1s; }
.col-center-anim   { animation: fadeUp    0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 1.05s; display: contents; }
.col-form          { animation: fadeRight 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 1.1s; }

/* ── Tokens ──────────────────────────────────────────────────────── */
.page-home {
  --green: #009640;
  --orange: #E65100;
  --black: #0D0D0D;
  --gray-100: #F7F7F5;
  --gray-200: #EBEBEB;
  --gray-500: #999;
  --gray-700: #555;
  --fw-black: 900;
  --fw-bold: 700;
  --track-wide: 0.12em;
  --radius: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* ── Layout helpers ──────────────────────────────────────────────── */
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 48px; }

.section-overline {
  font-size: 0.7rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: var(--track-wide);
  color: var(--orange);
  margin-bottom: 8px;
}
.section-title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: var(--fw-black);
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1;
}
.section-head-row { display: flex; justify-content: space-between; align-items: flex-end; }
.section-link { font-size: 0.85rem; font-weight: var(--fw-bold); color: var(--green); text-decoration: none; letter-spacing: 0.02em; white-space: nowrap; padding-bottom: 2px; border-bottom: 1px solid var(--green); }
.s-section-head { margin-bottom: 40px; }

/* Buttons */
.btn-primary {
  display: inline-block;
  background: var(--green);
  color: white;
  font-size: 0.85rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 28px;
  text-decoration: none;
  border: 2px solid var(--green);
  transition: background 0.2s, color 0.2s;
}
.btn-primary:hover { background: #007a33; border-color: #007a33; color: white; }
.btn-ghost {
  display: inline-block;
  background: transparent;
  color: white;
  font-size: 0.85rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 28px;
  text-decoration: none;
  border: 2px solid rgba(255,255,255,0.5);
  transition: border-color 0.2s;
}
.btn-ghost:hover { border-color: white; color: white; }

/* ── HERO — éditorial institutionnel ─────────────────────────────── */
.s-hero {
  position: relative;
  background: #F7F6F2;
  color: #12140F;
  overflow: hidden;
  border-bottom: 1px solid #E9E7E0;
}
/* Liseré drapeau ivoirien */
.s-hero__flagline {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(
    to right,
    #F77F00 0 33.34%,
    #FFFFFF 33.34% 66.67%,
    #009640 66.67% 100%
  );
}
.s-hero__inner {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 56px 48px 36px;
}
.s-hero__grid {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 48px;
  align-items: center;
}

/* Texte */
.s-hero__overline {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #74736A;
  margin-bottom: 22px;
}
.flag-chip { display: inline-flex; gap: 2px; flex-shrink: 0; }
.fc { display: block; width: 8px; height: 13px; }
.fc--orange { background: #F77F00; }
.fc--white  { background: #FFF; border: 1px solid #DDDBD2; }
.fc--green  { background: #009640; }

.s-hero__title {
  font-size: clamp(2.8rem, 6.5vw, 5.2rem);
  font-weight: var(--fw-black);
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: #12140F;
  margin: 0 0 18px;
}
.s-hero__title .t-green { color: var(--green); }

.s-hero__devise {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.02rem;
  color: #C0561B;
  margin-bottom: 10px;
}
.s-hero__sub {
  font-size: 0.95rem;
  color: #5C5B51;
  margin-bottom: 28px;
  letter-spacing: 0.02em;
}
.s-hero__ctas { display: flex; gap: 12px; flex-wrap: wrap; }

/* Bouton contour encre (fond clair) */
.btn-outline-ink {
  display: inline-block;
  background: transparent;
  color: #12140F;
  font-size: 0.85rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 28px;
  text-decoration: none;
  border: 2px solid #12140F;
  transition: all 0.2s;
}
.btn-outline-ink:hover { background: #12140F; color: white; }

/* Plaque armoiries */
.s-hero__emblem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.s-hero__tabouret {
  display: block;
  width: min(400px, 100%);
  height: auto;
  filter: drop-shadow(0 22px 34px rgba(30, 20, 10, 0.26));
  will-change: transform;
  /* Pivotement 3D doux et continu */
  animation: tabouretSway 9s ease-in-out infinite;
}
@keyframes tabouretSway {
  0%   { transform: perspective(900px) rotateY(-14deg) translateY(0); }
  25%  { transform: perspective(900px) rotateY(0deg)   translateY(-8px); }
  50%  { transform: perspective(900px) rotateY(14deg)  translateY(0); }
  75%  { transform: perspective(900px) rotateY(0deg)   translateY(-8px); }
  100% { transform: perspective(900px) rotateY(-14deg) translateY(0); }
}
/* Respect des préférences d'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .s-hero__tabouret { animation: none; }
}
.s-hero__plaque-caption {
  margin: 22px 0 0;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #8E8D82;
  text-align: center;
}

/* ── QUICK NAV ───────────────────────────────────────────────────── */
.s-quicknav {
  background: var(--orange);
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.s-quicknav::-webkit-scrollbar { display: none; }
.s-quicknav__inner {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
}
.qnav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  color: rgba(255,255,255,0.88);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-right: 1px solid rgba(255,255,255,0.18);
  white-space: nowrap;
  transition: color 0.2s, background 0.2s;
}
.qnav-item:first-child { border-left: 1px solid rgba(255,255,255,0.18); }
.qnav-item:hover { color: white; background: rgba(0,0,0,0.12); }
.qnav-icon { font-size: 1rem; }

/* ── SECTION MAIN ────────────────────────────────────────────────── */
.s-main { background: var(--gray-100); padding: 0; }
.s-main__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 340px 1fr 320px;
  min-height: 560px;
}

/* Side blocks */
.col-side { display: flex; flex-direction: column; border-right: 1px solid var(--gray-200); }
.side-block { padding: 32px 28px; }
.side-block:not(:last-child) { border-bottom: 1px solid var(--gray-200); }

.block-label {
  font-size: 0.65rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--green);
  margin-bottom: 20px;
}

/* Carousel events */
.ev-card { background: white; border: 1px solid var(--gray-200); }
.ev-img-wrap { position: relative; height: 175px; overflow: hidden; }
.ev-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.ev-card:hover .ev-img { transform: scale(1.04); }
.ev-badge {
  position: absolute; top: 12px; left: 12px;
  background: var(--orange); color: white;
  font-size: 0.7rem; font-weight: var(--fw-black);
  padding: 6px 12px; text-transform: uppercase; letter-spacing: 0.08em;
}
.ev-body { padding: 20px; }
.ev-title { font-size: 1.05rem; font-weight: var(--fw-bold); color: var(--black); margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.02em; }
.ev-sub { font-size: 0.88rem; color: var(--gray-700); margin: 0 0 14px; line-height: 1.5; }
.ev-link { font-size: 0.8rem; font-weight: var(--fw-bold); color: var(--green); text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Carousel Vue ─────────────────────────────────────────────────── */
.vue-carousel { display: flex; flex-direction: column; gap: 12px; }

/* Conteneur hauteur fixe pour éviter le saut de layout pendant la transition */
.vc-stage {
  position: relative;
  overflow: hidden;
  min-height: 255px;
}
.vc-stage--flash {
  min-height: 115px;
}

.vc-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.vc-btn {
  width: 30px; height: 30px;
  background: var(--green); color: white;
  border: none; cursor: pointer;
  font-size: 1.2rem; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.vc-btn--sm { background: var(--orange); width: 24px; height: 24px; font-size: 1rem; }
.vc-btn:hover { background: #007a33; }
.vc-btn--sm:hover { background: #bf360c; }
.vc-dots { display: flex; gap: 6px; align-items: center; }
.vc-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gray-200);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.vc-dot--active { background: var(--green); transform: scale(1.3); }

/* Transition glissement carte */
.slide-card-enter-active,
.slide-card-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-card-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-card-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Flash Info */
.flash-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: white;
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--orange);
  min-height: 90px;
}
.flash-dot { width: 8px; height: 8px; border-radius: 50%; background: red; flex-shrink: 0; margin-top: 4px; animation: blink 1.5s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.flash-cat { font-size: 0.68rem; font-weight: var(--fw-black); text-transform: uppercase; letter-spacing: 0.14em; color: var(--orange); margin: 0 0 5px; }
.flash-msg { font-size: 0.85rem; color: var(--gray-700); line-height: 1.5; margin: 0 0 10px; }
.flash-link { font-size: 0.74rem; font-weight: var(--fw-bold); color: var(--green); text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Post du jour ────────────────────────────────────────────────── */
.col-chart { display: flex; align-items: center; padding: 16px 20px; }
.pdj-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  transition: box-shadow 0.3s;
}
.pdj-card:hover { box-shadow: 0 8px 36px rgba(0,0,0,0.13); }
.pdj-img-wrap { position: relative; display: block; overflow: hidden; height: 320px; flex-shrink: 0; }
.pdj-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.pdj-card:hover .pdj-img { transform: scale(1.04); }
.pdj-category {
  position: absolute; top: 14px; left: 14px;
  background: var(--orange); color: white;
  font-size: 0.68rem; font-weight: var(--fw-bold);
  text-transform: uppercase; letter-spacing: 0.08em;
  padding: 4px 10px; border-radius: 20px;
}
.pdj-body { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; flex: 1; }
.pdj-meta { display: flex; align-items: center; gap: 8px; color: #888; font-size: 0.78rem; }
.pdj-sep { color: #ccc; }
.pdj-title {
  font-size: 1.15rem;
  font-weight: var(--fw-bold);
  color: var(--dark);
  line-height: 1.35;
}
.pdj-excerpt {
  font-size: 0.875rem;
  color: #555;
  line-height: 1.65;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pdj-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 14px; border-top: 1px solid #f0f0f0; }
.pdj-author { font-size: 0.78rem; color: #888; }
.pdj-btn {
  background: var(--orange); color: white;
  font-size: 0.78rem; font-weight: var(--fw-bold);
  padding: 8px 16px; border-radius: 6px;
  text-decoration: none; transition: background 0.2s;
}
.pdj-btn:hover { background: #bf4400; }

/* Menu column */
/* ── FORMULAIRE ENREGISTREMENT ──────────────────────────────────── */
.col-form { border-left: 1px solid var(--gray-200); display: flex; flex-direction: column; padding-left: 24px; }
.col-form > *:not(:last-child) { border-bottom: 1px solid var(--gray-200); }
.reg-form-wrap { padding: 32px 24px; }
.reg-subtitle { font-size: 0.8rem; color: #777; margin: -8px 0 24px; line-height: 1.5; }
.reg-form { display: flex; flex-direction: column; gap: 16px; }
.reg-field { display: flex; flex-direction: column; gap: 6px; }
.reg-label {
  font-size: 0.72rem;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--black);
  display: flex;
  align-items: center;
  gap: 6px;
}
.reg-label i { color: var(--orange); }
.reg-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--gray-200);
  border-radius: 0;
  font-size: 0.88rem;
  color: var(--black);
  background: var(--gray-100);
  outline: none;
  transition: border-color 0.2s;
}
.reg-input:focus { border-color: var(--green); background: white; }
.reg-input::placeholder { color: #bbb; }
.reg-btn {
  margin-top: 8px;
  padding: 12px 20px;
  background: var(--green);
  color: white;
  border: none;
  font-size: 0.8rem;
  font-weight: var(--fw-black);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.reg-btn:hover { background: #007a32; }

/* ── MAYOR ───────────────────────────────────────────────────────── */
.s-mayor { background: white; padding: 100px 0; border-top: 1px solid var(--gray-200); }
.s-mayor__inner { max-width: 1400px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.mayor-photo { width: 100%; height: 560px; object-fit: cover; object-position: top; display: block; }
.mayor-heading { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: var(--fw-black); color: var(--black); text-transform: uppercase; letter-spacing: -0.02em; line-height: 1; margin: 0 0 32px; }
.mayor-quote { font-size: 1.15rem; font-style: italic; color: var(--gray-700); border-left: 4px solid var(--orange); padding-left: 24px; margin: 0 0 32px; line-height: 1.8; }
.mayor-sig { margin-bottom: 36px; }
.mayor-sig__name { font-size: 1rem; font-weight: var(--fw-black); text-transform: uppercase; letter-spacing: 0.06em; color: var(--green); margin: 0; }
.mayor-sig__title { font-size: 0.8rem; color: var(--gray-500); margin: 4px 0 0; letter-spacing: 0.04em; }

/* ── NEWS ────────────────────────────────────────────────────────── */
.s-news { background: var(--gray-100); padding: 80px 0 60px; border-top: 1px solid var(--gray-200); }
.news-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--gray-200); }
.n-card { background: white; display: flex; flex-direction: column; text-decoration: none; transition: transform 0.2s; }
.n-card:hover { transform: translateY(-4px); }
.n-card__img { height: 200px; overflow: hidden; }
.n-card__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.n-card:hover .n-card__img img { transform: scale(1.05); }
.n-card__body { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.n-card__meta { display: flex; justify-content: space-between; align-items: center; }
.n-cat { background: var(--green); color: white; font-size: 0.6rem; font-weight: var(--fw-black); text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; }
.n-date { font-size: 0.72rem; color: var(--gray-500); }
.n-title { font-size: 0.95rem; font-weight: var(--fw-bold); color: var(--black); line-height: 1.4; margin: 0; flex: 1; }
.n-more { font-size: 0.75rem; font-weight: var(--fw-bold); color: var(--orange); text-transform: uppercase; letter-spacing: 0.06em; margin-top: auto; }
.news-controls { display: flex; gap: 8px; margin-top: 24px; }
.news-ctrl {
  background: none; border: 1px solid var(--gray-200);
  padding: 10px 20px; font-size: 0.8rem; font-weight: var(--fw-bold);
  color: var(--gray-700); cursor: pointer; transition: all 0.2s;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.news-ctrl:hover { background: var(--black); color: white; border-color: var(--black); }

/* ── PROJECTS ────────────────────────────────────────────────────── */
.s-projects { background: white; padding: 80px 0; border-top: 1px solid var(--gray-200); }
.proj-layout { display: grid; grid-template-columns: 260px 1fr; gap: 0; border: 1px solid var(--gray-200); }
.proj-tabs { display: flex; flex-direction: column; border-right: 1px solid var(--gray-200); }
.proj-tab {
  padding: 20px 24px; text-align: left; background: none; border: none;
  border-bottom: 1px solid var(--gray-200);
  font-size: 0.82rem; font-weight: var(--fw-bold); color: var(--gray-700);
  text-transform: uppercase; letter-spacing: 0.04em;
  cursor: pointer; transition: all 0.2s;
}
.proj-tab:hover { background: var(--gray-100); color: var(--green); }
.proj-tab--active { background: var(--green); color: white; border-left: none; }
.proj-tab--active:hover { background: #007a33; color: white; }

.proj-content { display: grid; grid-template-columns: 1fr 1fr; }
.proj-img-wrap { height: 100%; min-height: 320px; overflow: hidden; }
.proj-img { width: 100%; height: 100%; object-fit: cover; }
.proj-info { padding: 40px; }
.proj-title { font-size: 1.4rem; font-weight: var(--fw-black); color: var(--black); text-transform: uppercase; margin: 0 0 16px; }
.proj-text { font-size: 0.9rem; color: var(--gray-700); line-height: 1.7; margin-bottom: 24px; }
.proj-docs { border-top: 1px solid var(--gray-200); padding-top: 20px; }
.proj-docs__label { font-size: 0.65rem; font-weight: var(--fw-black); text-transform: uppercase; letter-spacing: 0.12em; color: var(--green); margin-bottom: 10px; }
.proj-doc { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--gray-200); margin-bottom: 6px; font-size: 0.82rem; font-weight: var(--fw-bold); color: var(--black); text-decoration: none; transition: background 0.2s; }
.proj-doc:hover { background: var(--gray-100); color: var(--orange); }
.proj-doc__size { margin-left: auto; font-size: 0.7rem; color: var(--gray-500); font-weight: 400; }

/* ── DISCOVER ────────────────────────────────────────────────────── */
.s-discover { background: var(--gray-100); padding: 80px 0; border-top: 1px solid var(--gray-200); }
.disc-tabs { display: flex; gap: 0; margin-bottom: 32px; border: 1px solid var(--gray-200); width: fit-content; }
.disc-pill {
  padding: 12px 24px; background: white; border: none;
  border-right: 1px solid var(--gray-200);
  font-size: 0.78rem; font-weight: var(--fw-bold); color: var(--gray-700);
  text-transform: uppercase; letter-spacing: 0.06em;
  cursor: pointer; transition: all 0.2s;
}
.disc-pill:last-child { border-right: none; }
.disc-pill:hover { color: var(--green); }
.disc-pill--active { background: var(--green); color: white; }
.disc-pill--active:hover { color: white; }

.place-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--gray-200); }
.place-card { background: white; }
.place-img { height: 180px; overflow: hidden; position: relative; }
.place-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.place-card:hover .place-img img { transform: scale(1.05); }
.place-badge { position: absolute; bottom: 10px; left: 10px; background: var(--orange); color: white; font-size: 0.6rem; font-weight: var(--fw-black); padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.08em; }
.place-body { padding: 20px; }
.place-name { font-size: 0.95rem; font-weight: var(--fw-bold); color: var(--black); margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.02em; }
.place-info { font-size: 0.8rem; color: var(--gray-700); margin: 4px 0; }
.disc-empty { padding: 60px; text-align: center; color: var(--gray-500); background: white; font-size: 0.9rem; border: 1px solid var(--gray-200); }

/* ── INVEST ──────────────────────────────────────────────────────── */
.s-invest {
  background: linear-gradient(160deg, #004d20 0%, #009640 100%);
  padding: 100px 0;
  border-top: 4px solid var(--orange);
}
.s-invest .section-overline { color: rgba(255,255,255,0.7); }
.s-invest .section-title { color: white; }
.s-invest .s-section-head { margin-bottom: 56px; }
.invest-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.15); }
.inv-card {
  background: rgba(0, 80, 33, 0.5);
  padding: 36px 28px;
  border-top: 3px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.inv-card:hover { border-top-color: var(--orange); background: rgba(0, 80, 33, 0.8); }
.inv-num { display: block; font-size: 0.6rem; font-weight: var(--fw-black); color: rgba(255,255,255,0.5); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
.inv-title { font-size: 0.9rem; font-weight: var(--fw-black); color: white; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }
.inv-text { font-size: 0.82rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin: 0; }

/* ── Transitions ─────────────────────────────────────────────────── */
.fade-tab-enter-active, .fade-tab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-tab-enter-from, .fade-tab-leave-to { opacity: 0; transform: translateY(6px); }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .s-main__inner { grid-template-columns: 1fr; }
  .col-side { border-right: none; border-bottom: 1px solid var(--gray-200); }
  .col-form { border-left: none; border-top: 1px solid var(--gray-200); }
  .chart-wrap { width: min(220px, 90%); }
  .news-grid { grid-template-columns: repeat(2, 1fr); }
  .invest-grid { grid-template-columns: repeat(2, 1fr); }
  .place-grid { grid-template-columns: repeat(2, 1fr); }
  .s-mayor__inner { grid-template-columns: 1fr; }
  .mayor-photo { height: 300px; }
}
@media (max-width: 992px) {
  .s-hero__grid { grid-template-columns: 1fr; gap: 36px; }
  .s-hero__emblem { justify-content: flex-start; }
  .s-hero__tabouret { width: 280px; }
}
@media (max-width: 768px) {
  .container-wide { padding: 0 20px; }
  .s-hero__inner { padding: 48px 20px 32px; }
  .s-hero__title { font-size: 3rem; }
  .s-quicknav__inner { padding: 0 20px; }
  .proj-layout { grid-template-columns: 1fr; }
  .proj-tabs { flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--gray-200); }
  .proj-content { grid-template-columns: 1fr; }
  .news-grid { grid-template-columns: 1fr; }
  .invest-grid { grid-template-columns: 1fr 1fr; }
  .disc-tabs { flex-wrap: wrap; }
}
</style>
