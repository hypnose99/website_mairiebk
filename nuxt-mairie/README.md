# Mairie de Bouaké — Frontend Nuxt 3

Site institutionnel de la Mairie de Bouaké (Côte d'Ivoire), migré d'un prototype HTML/CSS statique vers une application **Nuxt 3** moderne avec SSR hybride, PWA et i18n.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Nuxt 3.13 (Vue 3, Composition API) |
| Rendu | SSR hybride + prérendu statique |
| State | Pinia |
| i18n | @nuxtjs/i18n v8 (Français + Dioula) |
| CSS | Bootstrap 5.3 + CSS custom (`assets/css/main.css`) |
| Icônes | Bootstrap Icons 1.11 |
| PWA | @vite-pwa/nuxt (Workbox, Service Workers) |
| Serveur | Nitro (API routes intégrées) |
| Types | TypeScript strict |

---

## Lancer le projet

```bash
# Installation des dépendances
npm install

# Serveur de développement → http://localhost:3000
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Générer le site statique
npm run generate
```

> **Node requis :** v20.17+ (v20.19+ recommandé pour éviter les warnings chokidar)

---

## Structure des dossiers

```
nuxt-mairie/
├── app.vue                  # Racine de l'app (layout, offline banner, transitions)
├── nuxt.config.ts           # Config principale (SSR, modules, i18n, PWA, CSS)
│
├── pages/                   # Routes automatiques Nuxt
│   ├── index.vue            # Accueil (hero SVG, carousels, actualités, projets…)
│   ├── elus.vue             # Élus (Maire + Adjoints flip cards)
│   ├── services.vue         # Services aux citoyens
│   ├── projets.vue          # Projets de la ville
│   └── actualites/
│       ├── index.vue        # Liste des actualités (filtres + pagination)
│       └── [slug].vue       # Détail d'un article
│
├── layouts/
│   └── default.vue          # AppHeader + main + AppFooter
│
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue    # Header fixe, nav, burger mobile, sélecteur langue
│   │   └── AppFooter.vue    # Footer 3 colonnes
│   ├── ui/
│   │   ├── FlipCard.vue     # Carte flip CSS (verso = attributions adjoint)
│   │   ├── ProjectCard.vue  # Galerie + barre de progression
│   │   ├── NewsCard.vue     # Carte article (variant featured / compact)
│   │   └── ServiceAccordion.vue  # Accordéon Vue pur (sans Bootstrap JS)
│   └── home/
│       └── CityChart.vue    # Composant SVG graphique central
│
├── composables/
│   ├── useElus.ts           # Fetch maire + adjoints
│   ├── useProjects.ts       # Fetch projets (filtres par statut)
│   └── useActualites.ts     # Fetch actualités (pagination + filtres)
│
├── stores/
│   └── useAppStore.ts       # Pinia : menu mobile, notifications, offline
│
├── server/
│   └── api/
│       ├── elus.get.ts
│       ├── projects.get.ts
│       ├── actualites.get.ts
│       └── actualites/[slug].get.ts
│
├── data/                    # Données JSON (source des API)
│   ├── elus.json
│   ├── projects.json
│   └── actualites.json
│
├── types/
│   └── index.ts             # Interfaces TypeScript (Maire, Adjoint, Actualite…)
│
├── i18n/
│   ├── i18n.config.ts       # Formats date/nombre (fr-CI, XOF)
│   └── locales/
│       ├── fr.json          # Traductions français
│       └── dioula.json      # Traductions dioula (dyu-CI)
│
├── plugins/
│   └── bootstrap.client.ts  # Bootstrap JS (chargé côté client uniquement)
│
├── assets/
│   ├── css/
│   │   ├── main.css         # Styles globaux + tous les composants index
│   │   └── _variables.scss  # Variables SCSS injectées globalement
│   └── images/
│
├── public/
│   ├── manifest.json        # PWA manifest
│   └── images/              # Logo, photo Maire, icônes PWA
│
└── utils/
    └── index.ts             # Fonctions utilitaires (truncate, slugToTitle…)
```

---

## Rendu hybride (routeRules)

| Route | Mode |
|---|---|
| `/` | Prérendu statique |
| `/elus` | Prérendu statique |
| `/services` | Prérendu statique |
| `/projets` | Prérendu statique |
| `/actualites/**` | SSR à chaque requête |
| `/api/**` | Cache serveur 10 min |

---

## Internationalisation

Deux langues configurées :

- **Français** (`fr`) — locale par défaut, urls sans préfixe
- **Dioula** (`dioula`) — urls préfixées `/dioula/...`

Les fichiers de traduction sont dans `i18n/locales/`. Le format monétaire utilise le **Franc CFA (XOF)** et la locale `fr-CI`.

---

## PWA

Le site fonctionne hors ligne grâce aux Service Workers Workbox :

- **Pages** → stratégie `NetworkFirst`
- **Images** → stratégie `CacheFirst` (cache 30 jours)
- **API** → stratégie `StaleWhileRevalidate`

---

## Bootstrap JS

Bootstrap JS est chargé uniquement côté client via `plugins/bootstrap.client.ts` (suffixe `.client.ts`). Les carousels et autres composants Bootstrap utilisent les attributs `data-bs-*` et s'initialisent automatiquement après hydratation.

---

## Ajouter du contenu

**Nouvelle actualité** → éditer `data/actualites.json`  
**Nouveau projet** → éditer `data/projects.json`  
**Modifier les élus** → éditer `data/elus.json`  
**Nouvelle traduction** → éditer `i18n/locales/fr.json` et `i18n/locales/dioula.json`
