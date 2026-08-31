# Projet Mairie de Bouaké — Documentation de reprise

Ce dépôt contient deux éléments principaux :

- un site public moderne basé sur Nuxt 3 dans le dossier `nuxt-mairie/`
- un back-office CMS Strapi 5 dans le dossier `strapi-admin/`
- un ensemble de fichiers HTML statiques à la racine, hérités du prototype initial et non utilisés comme source de vérité principale du projet actuel

Le projet est un site institutionnel de la Mairie de Bouaké (Côte d’Ivoire), avec des pages d’information, des actualités, des projets, des élus, des services citoyens, et un système de contenu éditable via Strapi.

---

## 1. Vue d’ensemble du projet

### Objectif
Le site vise à présenter :
- l’identité et les institutions de la commune,
- les actualités et la communication locale,
- les projets municipaux,
- les services administratifs pour les citoyens,
- les élus et leurs responsabilités,
- un accès multilingue (français + dioula).

### Architecture générale

```
mairieaccueil/
├── README.md                  # Documentation de reprise
├── index.html                 # Prototype statique historique
├── article.html               # Prototype statique historique
├── services.html              # Prototype statique historique
├── projets.html               # Prototype statique historique
├── maire.html                 # Prototype statique historique
├── elus.html                  # Prototype statique historique
├── script.js                  # Script JS historique
├── style.css                  # CSS historique
├── images/                    # Images de l'ancien prototype
│
├── nuxt-mairie/               # Frontend actif principal
│   ├── app.vue
│   ├── nuxt.config.ts
│   ├── package.json
│   ├── .env.example
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── data/
│   ├── i18n/
│   ├── layouts/
│   ├── locales/
│   ├── pages/
│   ├── plugins/
│   ├── public/
│   ├── server/
│   ├── stores/
│   ├── types/
│   └── utils/
│
└── strapi-admin/              # CMS backend actif
    ├── package.json
    ├── config/
    ├── src/
    ├── public/
    ├── database/
    └── ...
```

### Rôle des deux applications

- `nuxt-mairie/` : site public visible par les visiteurs, construit avec Nuxt 3.
- `strapi-admin/` : CMS qui stocke les contenus éditables (actualités, projets, événements, flash infos, etc.).

Le frontend consomme l’API Strapi pour afficher les contenus dynamiques. En cas d’indisponibilité du CMS, il peut basculer sur des données JSON locales dans `nuxt-mairie/data/`.

---

## 2. Stack technique

### Frontend Nuxt
- Nuxt 3
- Vue 3
- TypeScript
- Pinia
- Bootstrap 5
- Bootstrap Icons
- @nuxtjs/i18n pour la traduction FR / Dioula
- SSR + rendu statique selon les routes

### Backend Strapi
- Strapi 5
- PostgreSQL (configuration prévue dans `strapi-admin/config/database.js`)
- API REST / content-types personnalisés
- Gestion des médias et contenus éditoriaux via interface d’administration

### Points d’entrée des scripts

Fichier `nuxt-mairie/package.json` :

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

Fichier `strapi-admin/package.json` :

```json
{
  "scripts": {
    "dev": "strapi develop",
    "build": "strapi build",
    "start": "strapi start",
    "strapi": "strapi"
  }
}
```

---

## 3. Prérequis

### Frontend
- Node.js >= 20
- npm

### Backend Strapi
- Node.js >= 20
- PostgreSQL local ou distant
- Variables d’environnement configurées

> Le projet est construit pour des environnements Node 20+ et Strapi 5. Il est recommandé de rester sur une version Node compatible avec cette stack.

---

## 4. Démarrage du projet

### 4.1 Installer les dépendances

#### Frontend
```bash
cd nuxt-mairie
npm install
```

#### Backend
```bash
cd strapi-admin
npm install
```

### 4.2 Démarrer le frontend
```bash
cd nuxt-mairie
npm run dev
```

Puis ouvrir :
- http://localhost:3000

### 4.3 Démarrer le CMS Strapi
```bash
cd strapi-admin
npm run develop
```

Puis ouvrir :
- http://localhost:1337/admin

### 4.4 Build de production

Frontend :
```bash
cd nuxt-mairie
npm run build
npm run preview
```

Backend :
```bash
cd strapi-admin
npm run build
npm run start
```

---

## 5. Configuration de l’environnement

### Frontend : `nuxt-mairie/.env.example`

Ce fichier contient les variables principales attendues par Nuxt :

```env
SITE_URL=https://mairie-bouake.ci
API_BASE=/api
API_SECRET_KEY=changez_cette_valeur_en_production
ANALYTICS_ID=
NODE_ENV=development
```

Le fichier `nuxt.config.ts` configure également :
- SSR actif,
- modules Pinia + i18n,
- CSS global Bootstrap + styles internes,
- runtimeConfig avec `strapiUrl`, `strapiToken`, `siteUrl`, etc.

### Backend : Strapi
Configuration de la base de données dans :
- `strapi-admin/config/database.js`

Le projet utilise PostgreSQL avec des valeurs par défaut :
- host: `localhost`
- port: `5432`
- database: `strapi`
- user: `strapi`
- password: `strapi`

Il faut éventuellement créer la base avant de lancer Strapi.

---

## 6. Structure du frontend Nuxt

### Fichier principal
- `nuxt-mairie/app.vue` : point d’entrée global, affiche les notifications et la bannière hors ligne.
- `nuxt-mairie/nuxt.config.ts` : configuration du projet, i18n, CSS, runtime config, plugins.

### Pages
Les pages principales sont dans `nuxt-mairie/pages/` :

- `index.vue` : page d’accueil
- `services.vue` : services aux citoyens
- `elus.vue` : élus et mairies
- `projets.vue` : projets municipaux
- `actualites/index.vue` : liste des actualités
- `actualites/[slug].vue` : détail d’un article
- `opportunites.vue` : opportunités / développement local

### Composants
Le dossier `components/` est organisé par rôle :

- `components/layout/`
  - `AppHeader.vue`
  - `AppFooter.vue`
- `components/ui/`
  - `FlipCard.vue`
  - `NewsCard.vue`
  - `ProjectCard.vue`
  - `ProjectModal.vue`
  - `ServiceAccordion.vue`
- `components/home/`
  - `ActualitesSection.vue`
  - `CitoyenForm.vue`
  - `CityChart.vue`
  - `EventCarousel.vue`
  - `FlashInfo.vue`
  - `PostDuJour.vue`
  - `ProjetsSection.vue`
  - `QueFaireSection.vue`

### Données et logique métier
- `data/actualites.json` : données d’actualités locales
- `data/projects.json` : données de projets locales
- `data/elus.json` : données des élus locales
- `composables/useActualites.ts` : logique de chargement des actualités
- `composables/useProjects.ts` : logique de chargement des projets
- `composables/useElus.ts` : logique de chargement des élus
- `stores/useAppStore.ts` : store Pinia global pour l’état UI et notifications
- `types/index.ts` : interfaces TypeScript du domaine

### API côté Nuxt
Les routes API de serveur sont dans `nuxt-mairie/server/api/` :

- `actualites.get.ts`
- `projects.get.ts`
- `elus.get.ts`
- `evenements.get.ts`
- `flash-info.get.ts`
- `actualites/[slug].get.ts`

Les transformations Strapi → format Nuxt sont centralisées dans :
- `nuxt-mairie/server/utils/strapi.ts`

### Internationalisation
- `nuxt-mairie/i18n/i18n.config.ts`
- `nuxt-mairie/i18n/locales/fr.json`
- `nuxt-mairie/i18n/locales/dioula.json`
- `nuxt-mairie/locales/fr.json`
- `nuxt-mairie/locales/dioula.json`

Le site est configuré pour :
- Français par défaut
- Dioula en langue supplémentaire
- stratégie `prefix_except_default`

---

## 7. Flux de données principal

### Schéma de fonctionnement

1. Le frontend Nuxt charge les contenus via `useFetch` ou `useAsyncData`.
2. Les appelés passent par des routes serveur internes comme `/api/actualites`.
3. Ces routes appellent l’API Strapi (`config.strapiUrl`) avec des filtres, tri et pagination.
4. Les éléments reçus sont transformés dans `server/utils/strapi.ts` pour correspondre au format attendu par le frontend.
5. Le frontend affiche les données dans les pages et composants Vue.
6. Si Strapi est indisponible, un fallback JSON local est utilisé dans les APIs du frontend.

### Exemple concret : actualités
- `pages/index.vue` charge des actualités via `useFetch('/api/actualites', { query: { perPage: 8 } })`
- `server/api/actualites.get.ts` construit la requête Strapi
- transformation via `transformActualite()` dans `server/utils/strapi.ts`
- résultat renvoyé au frontend sous forme de `items`, `total`, `page`, `perPage`

### Exemple concret : projets
- `server/api/projects.get.ts` charge les projets depuis Strapi,
- si erreur, fallback vers `data/projects.json`,
- plusieurs filtres possibles : statut, recherche, catégorie.

---

## 8. Structure du backend Strapi

Le dossier `strapi-admin/src/api/` contient les content-types principaux :

- `/actualite/`
- `/evenement/`
- `/flash-info/`
- `/projet/`

Ils correspondent grosso modo aux contenus suivants :
- actualités
- événements
- flash infos
- projets

Les configurations globales du serveur et base sont dans :
- `strapi-admin/config/server.js`
- `strapi-admin/config/database.js`
- `strapi-admin/config/admin.js`

### Impact fonctionnel
Le CMS est la source éditable du contenu. La plupart des contenus visibles sur le site public sont rendus dynamiquement à partir de Strapi.

---

## 9. Règles de content management importantes

### Fichiers JSON locaux utiles pour le fallback
Les données JSON locales peuvent servir à :
- travailler sans Strapi,
- faire des tests de rendu,
- alimenter des contenus d’exemple avant publication.

Fichiers concernés :
- `nuxt-mairie/data/actualites.json`
- `nuxt-mairie/data/projects.json`
- `nuxt-mairie/data/elus.json`

### Références de contenus
Le site utilise des champs comme :
- `slug`
- `publishedAt`
- `featured`
- `category`
- `status`
- `coverImage`
- `tags`

La transformation côté Nuxt normalise les valeurs Strapi pour l’affichage front.

---

## 10. Points de vigilance / risques connus

### 10.1 Base de données Strapi
La configuration de la DB est définie explicitement dans `config/database.js`; si la base n’existe pas ou si les identifiants sont mauvais, le démarrage du CMS échoue.

### 10.2 Fallback JSON
Le frontend utilise le JSON local quand Strapi n’est pas disponible, ce qui peut entraîner des écarts entre les contenus en staging/local et le CMS réel.

### 10.3 i18n et URLs
La configuration i18n applique un comportement de routage spécifique : le français est la langue par défaut sans préfixe, le dioula est préfixé.

### 10.4 Prototypes statiques hérités
Les fichiers HTML de la racine ne doivent pas être pris comme source de vérité pour le site actuel. Le projet actif est le frontend Nuxt + Strapi.

### 10.5 dépendances et versions
Le frontend et Strapi doivent tourner avec des versions Node compatibles. Le backend impose `node >=20` et le frontend est pensé en Nuxt 3 avec Vue 3 moderne.

---

## 11. Commandes de référence rapide

### Frontend
```bash
cd nuxt-mairie
npm install
npm run dev
npm run build
npm run preview
npm run generate
```

### Strapi
```bash
cd strapi-admin
npm install
npm run develop
npm run build
npm run start
```

---

## 12. Comment reprendre le projet

### Pour un développeur
1. Cloner le dépôt.
2. Installer les dépendances du frontend et du CMS.
3. Créer la base PostgreSQL pour Strapi.
4. Configurer les variables d’environnement.
5. Démarrer Strapi puis vérifier l’admin.
6. Démarrer le frontend Nuxt.
7. Vérifier les contenus dans : actualités, projets, événements, flash infos.
8. Modifier les données côté CMS ou dans les JSON de fallback selon le besoin.

### Pour un agent IA / assistant de code
Considérer les points suivants comme source de vérité :
- `nuxt-mairie/` = code applicatif principal
- `strapi-admin/` = CMS éditable
- `server/utils/strapi.ts` = point central de transformation des données
- `data/*.json` = fallback local et source des contenus de secours
- `nuxt.config.ts` = centre de configuration du frontend

---

## 13. À retenir

Le projet n’est pas un simple site statique : c’est une application Nuxt 3 connectée à Strapi pour la gestion des contenus. Le code le plus important à connaître pour comprendre le flux complet est :

- `nuxt-mairie/nuxt.config.ts`
- `nuxt-mairie/server/api/*.get.ts`
- `nuxt-mairie/server/utils/strapi.ts`
- `nuxt-mairie/pages/*.vue`
- `strapi-admin/config/*.js`
- `strapi-admin/src/api/*`

---

## 14. Recommandation pour la continuité

Pour éviter les erreurs de reprise :
- garder Strapi comme source de vérité des contenus éditoriaux,
- utiliser les JSON locaux uniquement pour fallback ou prototypage,
- documenter toute modification de structure de contenu dans le CMS,
- vérifier la compatibilité des champs Strapi avec les transformateurs Nuxt.

---

## 15. Résumé ultra court

- Frontend : Nuxt 3 / Vue 3 / Bootstrap / i18n
- Backend : Strapi 5 / PostgreSQL
- Site public : `nuxt-mairie/`
- CMS : `strapi-admin/`
- Données de fallback : `nuxt-mairie/data/`
- Point de transformation Strapi → front : `nuxt-mairie/server/utils/strapi.ts`

Cette documentation doit permettre à un autre développeur ou à une IA de reprendre le projet sans faire de suppositions sur l’architecture ou le rôle de chaque dossier.
