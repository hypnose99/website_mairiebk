<script setup lang="ts">
// pages/opportunites.vue — Appels d'offres, emplois, stages et petits boulots

useSeoMeta({
  title: 'Opportunités',
  description: 'Appels d\'offres, offres d\'emploi, stages et petits boulots proposés par la Mairie de Bouaké.',
})

// ── Types d'opportunités ─────────────────────────────────────────────────────
type OppType = 'appel_offre' | 'emploi' | 'stage' | 'petit_boulot'

interface Opportunite {
  id: string
  type: OppType
  titre: string
  description: string
  lieu: string
  dateLimite: string     // ISO
  contrat?: string       // CDD, durée, vacation...
  reference?: string
  conditions?: string[]
}

const TYPES: Record<OppType, { label: string; color: string; icon: string }> = {
  appel_offre:  { label: 'Appel d\'offres', color: '#E65100', icon: 'fa-solid fa-file-signature' },
  emploi:       { label: 'Emploi',          color: '#009640', icon: 'fa-solid fa-briefcase' },
  stage:        { label: 'Stage',           color: '#1565C0', icon: 'fa-solid fa-graduation-cap' },
  petit_boulot: { label: 'Petit boulot',    color: '#6D4C41', icon: 'fa-solid fa-hand-fist' },
}

// ── Offres (à brancher sur Strapi plus tard) ─────────────────────────────────
const opportunites: Opportunite[] = [
  {
    id: 'ao-lampadaires',
    type: 'appel_offre',
    titre: 'Fourniture et pose de 400 lampadaires solaires',
    description: 'Dans le cadre du programme d\'éclairage public, la commune lance un appel d\'offres pour la fourniture et l\'installation de lampadaires solaires dans les quartiers périphériques du 3e arrondissement.',
    lieu: '3e arrondissement',
    dateLimite: '2026-07-25',
    reference: 'AO-2026-014',
    conditions: [
      'Registre de commerce et attestation de régularité fiscale',
      'Références techniques sur 3 projets similaires',
      'Caution de soumission : 2 % du montant de l\'offre',
      'Dossier à retirer à la Direction des Marchés Publics',
    ],
  },
  {
    id: 'ao-caniveaux',
    type: 'appel_offre',
    titre: 'Réhabilitation des caniveaux du quartier Air France',
    description: 'Travaux de curage, de réfection et de couverture des caniveaux principaux du quartier Air France avant la saison des pluies.',
    lieu: 'Quartier Air France',
    dateLimite: '2026-08-10',
    reference: 'AO-2026-017',
    conditions: [
      'Agrément BTP catégorie B ou supérieure',
      'Attestation CNPS à jour',
      'Visite de site obligatoire (attestation délivrée sur place)',
    ],
  },
  {
    id: 'emploi-recouvrement',
    type: 'emploi',
    titre: 'Agents de recouvrement des taxes municipales (10 postes)',
    description: 'La régie des recettes recrute des agents de terrain chargés du recouvrement des taxes de marché et d\'occupation du domaine public.',
    lieu: 'Tous arrondissements',
    dateLimite: '2026-07-18',
    contrat: 'CDD 12 mois renouvelable',
    conditions: [
      'Niveau BEPC minimum',
      'Bonne connaissance des quartiers de Bouaké',
      'CV + lettre de motivation adressée au Maire',
    ],
  },
  {
    id: 'emploi-chauffeur',
    type: 'emploi',
    titre: 'Chauffeur poids lourd — Services techniques',
    description: 'Conduite des camions bennes et engins légers des services techniques municipaux. Permis CE exigé avec 5 ans d\'expérience.',
    lieu: 'Garage municipal',
    dateLimite: '2026-07-30',
    contrat: 'CDD 24 mois',
    conditions: [
      'Permis CE en cours de validité',
      '5 ans d\'expérience justifiée',
      'Certificat de visite médicale de moins de 3 mois',
    ],
  },
  {
    id: 'stage-communication',
    type: 'stage',
    titre: 'Stagiaire en communication digitale',
    description: 'Appui au service communication : animation des réseaux sociaux de la mairie, couverture photo des événements, rédaction d\'articles pour le site.',
    lieu: 'Hôtel de Ville',
    dateLimite: '2026-07-20',
    contrat: 'Stage 6 mois · indemnisé',
    conditions: [
      'BAC+2 minimum en communication ou journalisme',
      'Maîtrise des réseaux sociaux et outils de création',
      'Portfolio apprécié',
    ],
  },
  {
    id: 'stage-urbanisme',
    type: 'stage',
    titre: 'Stagiaire assistant en urbanisme',
    description: 'Participation à l\'instruction des permis de construire et à la mise à jour du plan d\'adressage de la commune.',
    lieu: 'Direction de l\'Urbanisme',
    dateLimite: '2026-08-05',
    contrat: 'Stage 4 mois · indemnisé',
    conditions: [
      'Étudiant en urbanisme, géographie ou génie civil',
      'Notions de SIG (QGIS) appréciées',
    ],
  },
  {
    id: 'pb-balayage',
    type: 'petit_boulot',
    titre: 'Opération « Grand Ménage » — Balayage de la ville (200 places)',
    description: 'Campagne mensuelle de salubrité : balayage des grandes artères, désherbage et évacuation des déchets. Ouvert à tous les habitants dès 18 ans, paiement à la journée.',
    lieu: 'Toute la commune',
    dateLimite: '2026-07-12',
    contrat: 'Vacation · payé à la journée',
    conditions: [
      'Être âgé de 18 ans minimum',
      'Se présenter avec sa CNI au service technique de son arrondissement',
      'Matériel fourni par la mairie',
    ],
  },
  {
    id: 'pb-hotesses',
    type: 'petit_boulot',
    titre: 'Hôtesses et hôtes d\'accueil — Événements municipaux',
    description: 'Accueil et orientation du public lors des cérémonies officielles, forums et festivals organisés par la commune.',
    lieu: 'Selon événements',
    dateLimite: '2026-07-31',
    contrat: 'Vacation · par événement',
    conditions: [
      'Bonne présentation et aisance à l\'oral',
      'Disponibilité les week-ends',
      'Une expérience similaire est un plus',
    ],
  },
  {
    id: 'pb-sensibilisation',
    type: 'petit_boulot',
    titre: 'Agents de sensibilisation — Campagne civique',
    description: 'Distribution de supports et sensibilisation de proximité sur la propreté, le civisme fiscal et l\'état civil dans les marchés et gares.',
    lieu: 'Marchés & gares routières',
    dateLimite: '2026-08-15',
    contrat: 'Vacation · 2 semaines',
    conditions: [
      'Bon relationnel, français et langues locales',
      'Formation d\'une journée assurée par la mairie',
    ],
  },
]

// ── Filtres ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { value: '',             label: 'Toutes' },
  { value: 'appel_offre',  label: 'Appels d\'offres' },
  { value: 'emploi',       label: 'Emplois' },
  { value: 'stage',        label: 'Stages' },
  { value: 'petit_boulot', label: 'Petits boulots' },
]
const selType = ref('')

const filtered = computed(() =>
  selType.value ? opportunites.filter(o => o.type === selType.value) : opportunites,
)

const countByType = (t: string) =>
  t ? opportunites.filter(o => o.type === t).length : opportunites.length

// ── Détails dépliables ───────────────────────────────────────────────────────
const openId = ref<string | null>(null)
const toggle = (id: string) => { openId.value = openId.value === id ? null : id }

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const isUrgent = (d: string) => {
  const diff = (new Date(d).getTime() - Date.now()) / 86400000
  return diff >= 0 && diff <= 10
}
</script>

<template>
  <div class="opp-page">

    <!-- ░░ HERO ENCRE ░░ -->
    <section class="ohero">
      <div class="ohero__flagline" aria-hidden="true" />
      <div class="ohero__inner">
        <p class="ohero__overline">
          <span class="flag-chip" aria-hidden="true">
            <i class="fc fc--orange" /><i class="fc fc--white" /><i class="fc fc--green" />
          </span>
          Travailler avec la commune · Mairie de Bouaké
        </p>
        <h1 class="ohero__title">
          Opportunités <span class="t-orange">&amp;</span> recrutements
        </h1>
        <p class="ohero__sub">
          Appels d'offres, offres d'emploi, stages et petits boulots :
          la mairie publie ici toutes les occasions de travailler pour votre ville.
        </p>
      </div>
    </section>

    <!-- ░░ FILTRES ░░ -->
    <div class="ofilters-wrap">
      <div class="ofilters">
        <button
          v-for="f in FILTERS"
          :key="f.value"
          class="ofilter"
          :class="{ 'ofilter--active': selType === f.value }"
          @click="selType = f.value"
        >
          {{ f.label }}
          <span class="ofilter__count">{{ countByType(f.value) }}</span>
        </button>
      </div>
    </div>

    <!-- ░░ LISTE ░░ -->
    <div class="olist">
      <article
        v-for="opp in filtered"
        :key="opp.id"
        class="ocard"
        :style="{ '--type-color': TYPES[opp.type].color }"
      >
        <!-- Bandeau type -->
        <div class="ocard__side" aria-hidden="true">
          <i :class="TYPES[opp.type].icon" />
        </div>

        <div class="ocard__body">
          <div class="ocard__top">
            <span class="ocard__badge">{{ TYPES[opp.type].label }}</span>
            <span v-if="opp.reference" class="ocard__ref">Réf. {{ opp.reference }}</span>
            <span v-if="isUrgent(opp.dateLimite)" class="ocard__urgent">
              <i class="fa-solid fa-hourglass-half" /> Clôture proche
            </span>
          </div>

          <h2 class="ocard__title">{{ opp.titre }}</h2>
          <p class="ocard__desc">{{ opp.description }}</p>

          <div class="ocard__meta">
            <span class="ocard__meta-item">
              <i class="fa-solid fa-location-dot" /> {{ opp.lieu }}
            </span>
            <span v-if="opp.contrat" class="ocard__meta-item">
              <i class="fa-solid fa-file-contract" /> {{ opp.contrat }}
            </span>
            <span class="ocard__meta-item ocard__meta-item--deadline">
              <i class="fa-solid fa-calendar-xmark" /> Clôture : {{ fmtDate(opp.dateLimite) }}
            </span>
          </div>

          <!-- Conditions dépliables -->
          <div v-if="opp.conditions?.length">
            <button class="ocard__toggle" @click="toggle(opp.id)">
              <i class="fa-solid fa-chevron-down" :class="{ 'is-open': openId === opp.id }" />
              {{ openId === opp.id ? 'Masquer les conditions' : 'Voir les conditions de candidature' }}
            </button>
            <Transition name="ocond">
              <ul v-if="openId === opp.id" class="ocard__conditions">
                <li v-for="c in opp.conditions" :key="c">{{ c }}</li>
              </ul>
            </Transition>
          </div>
        </div>
      </article>

      <!-- Note de dépôt -->
      <div class="onote">
        <i class="fa-solid fa-circle-info" />
        <p>
          Sauf mention contraire, les dossiers de candidature sont à déposer
          <strong>sous pli fermé au Secrétariat Général de l'Hôtel de Ville</strong>,
          du lundi au vendredi de 8h à 16h30.
        </p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ─── Hero encre (variante opportunités) ─────────────────────── */
.ohero {
  position: relative;
  background:
    radial-gradient(ellipse 70% 90% at 85% 10%, rgba(230, 81, 0, 0.14), transparent),
    #14170F;
  color: white;
  overflow: hidden;
}
.ohero__flagline {
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
.ohero__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 68px 48px 56px;
}
.ohero__overline {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 20px;
}
.flag-chip { display: inline-flex; gap: 2px; }
.fc { display: block; width: 8px; height: 13px; }
.fc--orange { background: #F77F00; }
.fc--white  { background: #FFF; }
.fc--green  { background: #009640; }

.ohero__title {
  font-size: clamp(2rem, 4.5vw, 3.6rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.02;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.ohero__title .t-orange { color: #F77F00; }
.ohero__sub {
  font-size: 0.95rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.72);
  max-width: 560px;
  margin: 0;
}

/* ─── Filtres ────────────────────────────────────────────────── */
.ofilters-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-bottom: 1px solid #EBEBEB;
}
.ofilters {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.ofilter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 17px 18px 14px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #777;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;
}
.ofilter:hover { color: #E65100; }
.ofilter--active {
  color: #E65100;
  border-bottom-color: #E65100;
}
.ofilter__count {
  font-size: 0.64rem;
  font-weight: 900;
  background: #F2F0EA;
  color: #77766B;
  padding: 2px 8px;
  border-radius: 20px;
}
.ofilter--active .ofilter__count { background: #FDEBDD; color: #E65100; }

/* ─── Liste ──────────────────────────────────────────────────── */
.olist {
  max-width: 980px;
  margin: 0 auto;
  padding: 48px 48px 88px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ─── Carte offre ────────────────────────────────────────────── */
.ocard {
  display: grid;
  grid-template-columns: 64px 1fr;
  background: white;
  border: 1px solid #E7E4DB;
  outline: 1px solid #E7E4DB;
  outline-offset: 4px;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.ocard:hover {
  transform: translateY(-3px);
  border-color: var(--type-color);
  box-shadow: 8px 8px 0 color-mix(in srgb, var(--type-color) 14%, transparent);
}

.ocard__side {
  background: color-mix(in srgb, var(--type-color) 8%, white);
  border-right: 3px solid var(--type-color);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 26px;
  font-size: 1.25rem;
  color: var(--type-color);
}

.ocard__body { padding: 24px 28px 22px; min-width: 0; }

.ocard__top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.ocard__badge {
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: white;
  background: var(--type-color);
  padding: 4px 12px;
}
.ocard__ref {
  font-size: 0.68rem;
  font-weight: 700;
  color: #A9A89D;
  letter-spacing: 0.06em;
}
.ocard__urgent {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #C62828;
  background: #FDECEA;
  padding: 4px 10px;
  margin-left: auto;
}

.ocard__title {
  font-size: 1.08rem;
  font-weight: 900;
  color: #12140F;
  line-height: 1.3;
  margin: 0 0 8px;
}
.ocard__desc {
  font-size: 0.87rem;
  color: #55544B;
  line-height: 1.7;
  margin: 0 0 14px;
}

.ocard__meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 12px 0;
  border-top: 1px dashed #EFEDE6;
}
.ocard__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #77766B;
}
.ocard__meta-item i { color: var(--type-color); font-size: 0.8rem; }
.ocard__meta-item--deadline { color: #12140F; }

/* Conditions dépliables */
.ocard__toggle {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: none;
  border: none;
  padding: 6px 0 0;
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--type-color);
  cursor: pointer;
}
.ocard__toggle i {
  font-size: 0.65rem;
  transition: transform 0.25s;
}
.ocard__toggle i.is-open { transform: rotate(180deg); }

.ocard__conditions {
  list-style: none;
  margin: 12px 0 0;
  padding: 14px 18px;
  background: #FAFAF7;
  border-left: 3px solid var(--type-color);
}
.ocard__conditions li {
  position: relative;
  padding: 5px 0 5px 18px;
  font-size: 0.82rem;
  color: #55544B;
}
.ocard__conditions li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--type-color);
  font-weight: 800;
}
.ocond-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.ocond-enter-from { opacity: 0; transform: translateY(-6px); }

/* Note de dépôt */
.onote {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #F3F8F4;
  border-left: 3px solid #009640;
  padding: 18px 22px;
  margin-top: 14px;
}
.onote i { color: #009640; font-size: 1.05rem; margin-top: 2px; }
.onote p { font-size: 0.84rem; color: #3E4A40; line-height: 1.7; margin: 0; }

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ohero__inner { padding: 48px 20px 40px; }
  .ofilters { padding: 0 20px; }
  .olist { padding: 32px 20px 64px; }
  .ocard { grid-template-columns: 1fr; }
  .ocard__side {
    flex-direction: row;
    padding: 12px 20px;
    border-right: none;
    border-bottom: 3px solid var(--type-color);
    justify-content: flex-start;
  }
  .ocard__urgent { margin-left: 0; }
}
</style>
