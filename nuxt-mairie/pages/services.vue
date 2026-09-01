<script setup lang="ts">
// pages/services.vue — Démarches administratives
import type { ServiceTheme, Demarche } from '~/types'

useSeoMeta({
  title: 'Services Citoyens',
  description: 'Retrouvez toutes les informations et pièces à fournir pour vos démarches administratives à la Mairie de Bouaké.',
})

const searchQuery = ref('')

// Recherches fréquentes (chips cliquables)
const quickSearches = ['Mariage', 'Naissance', 'Permis de construire', 'Subvention', 'Marché']

// Filtrage des thématiques par mot-clé (titre + prestations)
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const filteredThemes = computed(() => {
  const q = norm(searchQuery.value.trim())
  if (!q) return serviceThemes
  return serviceThemes.filter(t =>
    norm(t.title).includes(q) || t.items.some(i => norm(i).includes(q)),
  )
})

const serviceThemes: ServiceTheme[] = [
  {
    id: 'etat-civil',
    icon: 'bi-file-text-fill',
    title: 'État Civil',
    items: ['Déclaration de Naissance', 'Extrait d\'acte de naissance', 'Déclaration de décès', 'Légalisation de documents'],
  },
  {
    id: 'famille',
    icon: 'bi-heart-fill',
    title: 'Famille & Mariage',
    items: ['Célébration de Mariage', 'Certificat de non-divorce', 'Livret de famille', 'Déclaration de concubinage'],
  },
  {
    id: 'urbanisme',
    icon: 'bi-buildings-fill',
    title: 'Urbanisme',
    items: ['Demande de Permis de Construire', 'Autorisation de clôture', 'Certificat d\'urbanisme', 'Occupation du domaine public'],
  },
  {
    id: 'social',
    icon: 'bi-people-fill',
    title: 'Social & Subventions',
    items: ['Subventions aux Associations', 'Fonds d\'aide aux jeunes', 'Assistance sociale', 'Secours d\'urgence'],
  },
  {
    id: 'commerce',
    icon: 'bi-shop',
    title: 'Économie & Commerce',
    items: ['Création d\'entreprise (Guichet)', 'Place au marché central', 'Taxes municipales', 'Licence d\'exploitation'],
  },
]

const demarches: Demarche[] = [
  {
    id: 'mariage',
    title: 'Célébration de Mariage',
    delay: '30 jours avant',
    description: 'Le dossier de mariage doit être déposé à la Mairie par les deux futurs époux au moins 30 jours avant la date prévue de la célébration.',
    documents: [
      'Extrait d\'acte de naissance de chacun des futurs époux (datant de moins de 3 mois).',
      'Photocopie de la pièce d\'identité (CNI ou Passeport) des futurs époux.',
      'Photocopie de la pièce d\'identité des témoins (au moins 2 témoins).',
      'Certificat de résidence attestant que l\'un des futurs époux réside dans la commune.',
      'Une demande manuscrite adressée à Monsieur le Maire.',
      'Frais de dossier fixés par les services de l\'état civil.',
    ],
  },
  {
    id: 'subvention',
    title: 'Demande de Subvention (Associations et ONG)',
    description: 'La Mairie de Bouaké soutient les initiatives locales. Les demandes sont examinées lors des sessions du Conseil Municipal.',
    documents: [
      'Une lettre de demande motivée adressée au Maire.',
      'Les statuts et le règlement intérieur de l\'association.',
      'Le récépissé de déclaration de l\'association.',
      'Le bilan des activités de l\'année précédente.',
      'Le budget prévisionnel de l\'activité ou du projet à financer.',
      'Un Relevé d\'Identité Bancaire (RIB) au nom de l\'association.',
    ],
    note: 'Le dépôt du dossier se fait au Secrétariat Général de la Mairie.',
  },
  {
    id: 'naissance',
    title: 'Demande d\'Extrait d\'Acte de Naissance',
    description: 'Pour obtenir une copie ou un extrait de votre acte de naissance, présentez-vous au guichet de l\'État Civil.',
    documents: [
      'L\'ancien extrait de naissance ou le numéro de registre (si connu).',
      'Une pièce d\'identité valide (CNI).',
      'Le paiement du timbre municipal en vigueur.',
    ],
  },
  {
    id: 'permis-construire',
    title: 'Demande de Permis de Construire',
    description: 'Toute construction nouvelle ou modification importante nécessite un permis délivré par la Direction de l\'Urbanisme.',
    documents: [
      'Une demande adressée au Maire.',
      'Le titre de propriété (Attestation villageoise approuvée, Titre Foncier...).',
      'Le plan de situation et le plan de masse du terrain.',
      'Les plans architecturaux signés par un architecte agréé.',
      'La note de calcul (pour les bâtiments à étages).',
    ],
  },
]
</script>

<template>
  <div>
    <!-- Hero guichet — centré sur la recherche -->
    <section class="sv-hero">
      <div class="sv-hero__flagline" aria-hidden="true" />
      <div class="sv-hero__inner">
        <p class="sv-hero__overline">
          <span class="flag-chip" aria-hidden="true">
            <i class="fc fc--orange" /><i class="fc fc--white" /><i class="fc fc--green" />
          </span>
          Services aux citoyens · Mairie de Bouaké
        </p>
        <h1 class="sv-hero__title">
          Mes <span class="t-green">démarches</span> administratives
        </h1>
        <p class="sv-hero__sub">
          Toutes les informations et pièces à fournir pour vos formalités
          à l'Hôtel de Ville de Bouaké.
        </p>

        <form class="sv-search" @submit.prevent>
          <i class="bi bi-search sv-search__icon" />
          <input
            v-model="searchQuery"
            type="search"
            class="sv-search__input"
            placeholder="Que recherchez-vous ? (ex : Mariage, Naissance, Subvention...)"
            aria-label="Rechercher une démarche"
          />
          <button v-if="searchQuery" type="button" class="sv-search__clear" aria-label="Effacer" @click="searchQuery = ''">
            <i class="bi bi-x-lg" />
          </button>
        </form>

        <div class="sv-chips">
          <span class="sv-chips__label">Recherches fréquentes :</span>
          <button
            v-for="q in quickSearches"
            :key="q"
            type="button"
            class="sv-chip"
            :class="{ 'sv-chip--active': searchQuery === q }"
            @click="searchQuery = searchQuery === q ? '' : q"
          >
            {{ q }}
          </button>
        </div>
      </div>
    </section>

    <!-- Thèmes de service -->
    <section class="container py-5">
      <h2 class="stylish-section-title text-center mb-5">Accès Rapide par Thématique</h2>

      <div v-if="filteredThemes.length === 0" class="sv-empty">
        <i class="bi bi-search-heart" />
        <p>Aucune thématique ne correspond à « {{ searchQuery }} ».</p>
        <button type="button" class="sv-empty__reset" @click="searchQuery = ''">Tout afficher</button>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="(theme, i) in filteredThemes"
          :key="theme.id"
          class="col-lg-4 col-md-6"
        >
          <article :id="theme.id" class="sv-card">
            <span class="sv-card__fold" aria-hidden="true" />
            <span class="sv-card__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="sv-card__icon">
              <i :class="`bi ${theme.icon}`" />
            </div>
            <h3 class="sv-card__title">{{ theme.title }}</h3>
            <ul class="sv-card__list">
              <li v-for="item in theme.items" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- Accordéon démarches -->
    <section class="procedures-section">
      <div class="container">
        <h2 class="stylish-section-title text-center mb-5">Pièces à fournir pour les démarches courantes</h2>
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <UiServiceAccordion :demarches="demarches" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── Hero guichet (variante services) ───────────────────────── */
.sv-hero {
  position: relative;
  background:
    radial-gradient(ellipse 60% 80% at 50% 100%, rgba(0, 150, 64, 0.06), transparent),
    #FDFDFB;
  border-bottom: 1px solid #E9E7E0;
  overflow: hidden;
}
.sv-hero__flagline {
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
.sv-hero__inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 72px 24px 56px;
  text-align: center;
}
.sv-hero__overline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #74736A;
  margin-bottom: 20px;
}
.flag-chip { display: inline-flex; gap: 2px; }
.fc { display: block; width: 8px; height: 13px; }
.fc--orange { background: #F77F00; }
.fc--white  { background: #FFF; border: 1px solid #DDDBD2; }
.fc--green  { background: #009640; }

.sv-hero__title {
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.08;
  color: #12140F;
  margin: 0 0 14px;
}
.sv-hero__title .t-green { color: #009640; }
.sv-hero__sub {
  font-size: 0.95rem;
  color: #5C5B51;
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto 32px;
}

/* Grande barre de recherche */
.sv-search {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 2px solid #12140F;
  padding: 4px 20px;
  box-shadow: 6px 6px 0 rgba(0, 150, 64, 0.16);
  transition: box-shadow 0.25s;
}
.sv-search:focus-within { box-shadow: 6px 6px 0 rgba(0, 150, 64, 0.35); }
.sv-search__icon { color: #009640; font-size: 1.05rem; flex-shrink: 0; }
.sv-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 15px 0;
  font-size: 0.95rem;
  color: #12140F;
}
.sv-search__input::placeholder { color: #A9A89D; }
.sv-search__clear {
  background: none;
  border: none;
  color: #A9A89D;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 6px;
  transition: color 0.2s;
}
.sv-search__clear:hover { color: #12140F; }

/* Chips de recherche rapide */
.sv-chips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.sv-chips__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #A9A89D;
}
.sv-chip {
  background: white;
  border: 1px solid #DDDBD2;
  padding: 7px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #55544B;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.2s;
}
.sv-chip:hover { border-color: #009640; color: #009640; }
.sv-chip--active {
  background: #009640;
  border-color: #009640;
  color: white;
}

/* ─── Cartes "fiche guichet" ─────────────────────────────────── */
.sv-card {
  position: relative;
  height: 100%;
  background: white;
  border: 1px solid #E7E4DB;
  outline: 1px solid #E7E4DB;
  outline-offset: 4px;
  padding: 28px 26px 22px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
}
.sv-card:hover {
  transform: translateY(-5px);
  border-color: #12140F;
  box-shadow: 8px 8px 0 rgba(0, 150, 64, 0.14);
}

/* Coin plié façon formulaire papier */
.sv-card__fold {
  position: absolute;
  top: 0; right: 0;
  width: 0; height: 0;
  border-top: 28px solid #F1EFE8;
  border-left: 28px solid transparent;
  filter: drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.06));
  transition: border-top-color 0.25s;
}
.sv-card:hover .sv-card__fold { border-top-color: #E5F2E9; }

/* Numéro de fiche en contour */
.sv-card__num {
  position: absolute;
  top: 16px; right: 34px;
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.3px #D8D6CC;
  transition: -webkit-text-stroke-color 0.25s;
}
.sv-card:hover .sv-card__num { -webkit-text-stroke-color: #009640; }

/* Icône tamponnée */
.sv-card__icon {
  width: 54px;
  height: 54px;
  background: #F7F6F2;
  border: 1px solid #E7E4DB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #009640;
  box-shadow: 3px 3px 0 rgba(230, 81, 0, 0.22);
  margin-bottom: 18px;
  transition: box-shadow 0.25s, transform 0.25s;
}
.sv-card:hover .sv-card__icon {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 rgba(230, 81, 0, 0.32);
}

/* Titre + barre orange */
.sv-card__title {
  font-size: 0.92rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #12140F;
  margin: 0 0 8px;
}
.sv-card__title::after {
  content: '';
  display: block;
  width: 26px;
  height: 3px;
  background: #E65100;
  margin-top: 10px;
  transition: width 0.3s ease;
}
.sv-card:hover .sv-card__title::after { width: 48px; }

/* Liste des prestations */
.sv-card__list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
}
.sv-card__list li {
  position: relative;
  padding: 7px 0 7px 18px;
  font-size: 0.85rem;
  color: #55544B;
  border-bottom: 1px dashed #EFEDE6;
}
.sv-card__list li:last-child { border-bottom: none; }
.sv-card__list li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: #E65100;
  font-weight: 800;
}

/* État vide */
.sv-empty { text-align: center; padding: 40px 20px; color: #BBB; }
.sv-empty i { font-size: 2.6rem; display: block; margin-bottom: 14px; }
.sv-empty p { color: #999; margin-bottom: 18px; }
.sv-empty__reset {
  background: none;
  border: 1.5px solid #CCC;
  padding: 9px 26px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.sv-empty__reset:hover { border-color: #009640; color: #009640; }

@media (max-width: 576px) {
  .sv-hero__inner { padding: 52px 20px 40px; }
  .sv-search { padding: 2px 14px; }
}
</style>
