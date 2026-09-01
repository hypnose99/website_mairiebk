# Mairie de Bouaké — Documentation technique du projet

## 1. Présentation générale

Ce projet est une application web pour la mairie de Bouaké qui sépare clairement les responsabilités entre :

- un front-office Nuxt 3 pour l’affichage public,
- un CMS Strapi 5 pour l’édition des contenus,
- une base PostgreSQL hébergée via Supabase pour les données structurées,
- Cloudinary pour le stockage et le CDN des images et médias,
- un ensemble de fichiers statiques hérités à la racine, qui ne sont pas la source de vérité du projet actif.

Le site public sert à informer les citoyens sur :

- les actualités et communiqués,
- les projets de la ville,
- les services administratifs,
- les élus,
- les événements,
- les opportunités et initiatives locales.

---

## 2. Architecture globale

### 2.1 Rôle de chaque couche

#### Nuxt 3 / front public
C’est la couche d’affichage. Elle rassemble :

- les pages du site,
- les composants réutilisables,
- les styles,
- la logique d’appel API,
- la gestion de l’internationalisation,
- le routage front.

Le projet Nuxt est dans le dossier [nuxt-mairie](nuxt-mairie).

#### Strapi 5 / CMS
Strapi est la couche éditoriale. Il permet à l’équipe de la mairie de :

- créer et modifier des actualités,
- gérer les projets,
- publier des événements,
- alimenter les contenus textuels, images et galeries,
- exposer ces contenus via son API.

Le backend est dans le dossier [strapi-admin](strapi-admin).

#### Supabase / base de données
Supabase héberge la base PostgreSQL utilisée par Strapi. C’est là que les contenus structurés sont enregistrés.

En pratique :

- Strapi gère la structure de contenu,
- Supabase stocke les données en base,
- Nuxt ne parle pas directement à Supabase pour l’affichage public,
- Nuxt parle à l’API Strapi.

#### Cloudinary / médias
Cloudinary sert au stockage des images et médias. Les images sont envoyées dans le cloud, puis Strapi référence ces fichiers. Cela évite de stocker des fichiers lourds dans la base PostgreSQL.

En résumé :

- Supabase = données structurées,
- Cloudinary = fichiers multimédias,
- Strapi = interface d’édition + API,
- Nuxt = affichage public.

---

## 3. Découpage du projet

### 3.1 Racine du projet
La racine contient des fichiers legacy comme :

- index.html
- article.html
- services.html
- projets.html
- maire.html
- elus.html
- script.js
- style.css

Ces fichiers sont hérités du premier prototype. Ils ne sont pas la source de vérité du projet actuel. Le site actif est le front Nuxt + le CMS Strapi.

### 3.2 Dossier Nuxt
Le dossier [nuxt-mairie](nuxt-mairie) contient tout le front public.

Ses sous-dossiers sont structurés par rôle :

- [nuxt-mairie/pages](nuxt-mairie/pages) : routes de l’application,
- [nuxt-mairie/components](nuxt-mairie/components) : composants UI,
- [nuxt-mairie/components/layout](nuxt-mairie/components/layout) : header, footer, navigation,
- [nuxt-mairie/components/home](nuxt-mairie/components/home) : sections de la page d’accueil,
- [nuxt-mairie/components/ui](nuxt-mairie/components/ui) : composants génériques,
- [nuxt-mairie/server/api](nuxt-mairie/server/api) : routes serveur qui appellent Strapi,
- [nuxt-mairie/server/utils](nuxt-mairie/server/utils) : utilitaires de transformation des données,
- [nuxt-mairie/composables](nuxt-mairie/composables) : logique réutilisable pour les données,
- [nuxt-mairie/stores](nuxt-mairie/stores) : état global Pinia,
- [nuxt-mairie/data](nuxt-mairie/data) : données locales de secours,
- [nuxt-mairie/locales](nuxt-mairie/locales) : fichiers de traduction,
- [nuxt-mairie/public](nuxt-mairie/public) : fichiers publics statiques comme les images du site,
- [nuxt-mairie/nuxt.config.ts](nuxt-mairie/nuxt.config.ts) : config Nuxt, i18n, runtime config, CSS, plugins.

### 3.3 Dossier Strapi
Le dossier [strapi-admin](strapi-admin) contient le CMS.

Il contient :

- [strapi-admin/src/api](strapi-admin/src/api) : content-types personnalisés pour les actualités, projets, événements, etc.,
- [strapi-admin/config](strapi-admin/config) : configuration serveur, base de données, plugins, admin,
- [strapi-admin/public](strapi-admin/public) : ressources publiques du CMS,
- [strapi-admin/import-actualites.js](strapi-admin/import-actualites.js) : script d’import des actualités,
- [strapi-admin/import-projets.js](strapi-admin/import-projets.js) : script d’import des projets,
- [strapi-admin/import-evenements.js](strapi-admin/import-evenements.js) : script d’import des événements,
- [strapi-admin/update-images.js](strapi-admin/update-images.js) : migration / mise à jour des images.

---

## 4. Rôles du front-end Nuxt

### 4.1 Fichiers de configuration
Le fichier [nuxt-mairie/nuxt.config.ts](nuxt-mairie/nuxt.config.ts) centralise :

- le SSR,
- les modules Nuxt,
- les traductions i18n,
- le CSS global,
- le runtime config,
- la configuration Strapi et le site public.

Il définit notamment :

- les locales FR et Dioula,
- le CSS Bootstrap et les styles propres,
- les variables runtime comme STRAPI_URL et STRAPI_TOKEN.

### 4.2 Gestion du routage
Nuxt utilise le système de routage basé sur le dossier [nuxt-mairie/pages](nuxt-mairie/pages).

Les pages principales sont :

- [nuxt-mairie/pages/index.vue](nuxt-mairie/pages/index.vue) : page d’accueil
- [nuxt-mairie/pages/services.vue](nuxt-mairie/pages/services.vue) : services et démarches
- [nuxt-mairie/pages/elus.vue](nuxt-mairie/pages/elus.vue) : élus et personnalités
- [nuxt-mairie/pages/projets.vue](nuxt-mairie/pages/projets.vue) : projets municipaux
- [nuxt-mairie/pages/actualites/index.vue](nuxt-mairie/pages/actualites/index.vue) : liste des actualités
- [nuxt-mairie/pages/actualites/[slug].vue](nuxt-mairie/pages/actualites/[slug].vue) : page détail d’un article
- [nuxt-mairie/pages/opportunites.vue](nuxt-mairie/pages/opportunites.vue) : opportunités et développement local

### 4.3 Navigation du site
La navigation principale est gérée par [nuxt-mairie/components/layout/AppHeader.vue](nuxt-mairie/components/layout/AppHeader.vue).

Ce composant :

- affiche le logo,
- construit le menu principal,
- gère les liens vers les pages,
- charge le sélecteur de langue,
- gère le menu mobile,
- met à jour l’état du menu selon la route actuelle.

Le header est utilisé par le layout global [nuxt-mairie/layouts/default.vue](nuxt-mairie/layouts/default.vue), ce qui lui permet de rester présent sur toutes les pages.

---

## 5. Composants et leurs rôles

### 5.1 Composants de la page d’accueil
La page d’accueil est construite à partir de plusieurs blocs sectionnels.

#### [nuxt-mairie/components/home/ActualitesSection.vue](nuxt-mairie/components/home/ActualitesSection.vue)
Ce composant :

- récupère les dernières actualités via l’API interne Nuxt,
- affiche un carrousel de cartes d’articles,
- affiche les cartes avec image, catégorie, date, titre,
- redirige vers la page détail de l’article.

#### [nuxt-mairie/components/home/PostDuJour.vue](nuxt-mairie/components/home/PostDuJour.vue)
C’est la section “À la une”. Elle prend le premier article mis en avant et affiche :

- le titre,
- l’extrait,
- la date,
- l’auteur,
- l’image d’illustration,
- le lien vers l’article.

#### [nuxt-mairie/components/home/EventCarousel.vue](nuxt-mairie/components/home/EventCarousel.vue)
C’est la zone d’événements. Elle reçoit les contenus d’événements depuis l’API serveur et les affiche dans un carrousel ou une liste thématique.

#### [nuxt-mairie/components/home/FlashInfo.vue](nuxt-mairie/components/home/FlashInfo.vue)
Ce composant affiche les flash infos (informations urgentes ou poches messages de service).

#### [nuxt-mairie/components/home/CitoyenForm.vue](nuxt-mairie/components/home/CitoyenForm.vue)
Il affiche un formulaire de contact ou de service citoyen. Ce n’est pas directement lié à une table Strapi dans ce projet ; c’est souvent un bloc d’interaction front.

#### [nuxt-mairie/components/home/ProjetsSection.vue](nuxt-mairie/components/home/ProjetsSection.vue)
Affiche les projets phares de la commune avec visuel, intitulé, description et / ou liens.

#### [nuxt-mairie/components/home/QueFaireSection.vue](nuxt-mairie/components/home/QueFaireSection.vue)
Affiche des rubriques “Que faire / Où aller” selon des catégories comme hôtels, restaurants, tourisme, sport, etc.

### 5.2 Composants UI réutilisables

#### [nuxt-mairie/components/ui/NewsCard.vue](nuxt-mairie/components/ui/NewsCard.vue)
Carte générique pour afficher une actualité.

#### [nuxt-mairie/components/ui/ProjectCard.vue](nuxt-mairie/components/ui/ProjectCard.vue)
Carte de projet réutilisable.

#### [nuxt-mairie/components/ui/ProjectModal.vue](nuxt-mairie/components/ui/ProjectModal.vue)
Modale de détail pour ouvrir un projet en popup.

#### [nuxt-mairie/components/ui/FlipCard.vue](nuxt-mairie/components/ui/FlipCard.vue)
Carte avec animation flip utilisée pour des présentations visuelles.

#### [nuxt-mairie/components/ui/ServiceAccordion.vue](nuxt-mairie/components/ui/ServiceAccordion.vue)
Accordion pour afficher les services ou démarches administratives par catégorie.

### 5.3 Layout global

#### [nuxt-mairie/layouts/default.vue](nuxt-mairie/layouts/default.vue)
Le layout global reçoit :

- le header,
- le footer,
- les transitions entre pages,
- le conteneur global de l’application.

---

## 6. Comment les pages interagissent entre elles

Le système repose sur trois niveaux d’interaction :

### 6.1 Niveau 1 : navigation entre pages
Les pages sont liées via `NuxtLink` ou les liens du header.

Exemple :

- clique sur une carte actualité → redirection vers /actualites/[slug]
- clique sur “Services” → navigation vers /services
- clique sur un projet → ouverture d’une vue ou d’une modale

### 6.2 Niveau 2 : appel API côté Nuxt
Les composants et pages ne chargent pas directement Strapi. Ils passent par des routes Nuxt internes dans [nuxt-mairie/server/api](nuxt-mairie/server/api).

Exemple réel dans [nuxt-mairie/pages/index.vue](nuxt-mairie/pages/index.vue) :

- `useFetch('/api/actualites', { query: { perPage: 8 } })`
- `useFetch('/api/flash-info')`
- `useFetch('/api/evenements', { query: { perPage: 6 } })`

Cela donne un accès centralisé au backend et simplifie la logique front.

### 6.3 Niveau 3 : transformation des données
Les données récupérées de Strapi sont normalisées dans [nuxt-mairie/server/utils/strapi.ts](nuxt-mairie/server/utils/strapi.ts).

Ce fichier contient des fonctions comme :

- `transformActualite()`
- `transformProject()`
- `transformEvenement()`
- `transformFlashInfo()`

Ces fonctions :

- convertissent les objets Strapi en structures plus simples,
- gèrent les URLs de médias,
- normalisent les images de couverture,
- créent des champs utiles pour le front comme `coverImage`, `categoryLabel`, `slug`, `excerpt`.

---

## 7. Flux de récupération des données

### 7.1 Exemple : article principal
Le flux est le suivant :

1. La page [nuxt-mairie/pages/actualites/[slug].vue](nuxt-mairie/pages/actualites/[slug].vue) reçoit le slug depuis l’URL.
2. Elle exécute `useFetch('/api/actualites/${slug}')`.
3. La route serveur [nuxt-mairie/server/api/actualites/[slug].get.ts](nuxt-mairie/server/api/actualites/[slug].get.ts) appelle l’API Strapi.
4. Strapi renvoie le contenu éditorial.
5. Les données sont transformées dans [nuxt-mairie/server/utils/strapi.ts](nuxt-mairie/server/utils/strapi.ts).
6. La page affiche :
   - le titre,
   - la couverture,
   - le texte,
   - la galerie,
   - les tags,
   - la date,
   - l’auteur,
   - les éléments visuels associés.

### 7.2 Exemple : page d’accueil
Dans [nuxt-mairie/pages/index.vue](nuxt-mairie/pages/index.vue), plusieurs appels de données sont lancés :

- dernières actualités,
- article à la une,
- flash infos,
- événements,
- données statiques de projets ou contenus de démonstration.

Ensuite, les données sont transmises aux composants de section :

- `HomeEventCarousel`
- `HomePostDuJour`
- `HomeFlashInfo`
- `HomeCitoyenForm`
- `ActualitesSection`

### 7.3 Exemple : liste des actualités
Le fichier [nuxt-mairie/pages/actualites/index.vue](nuxt-mairie/pages/actualites/index.vue) récupère les actualités, les filtre éventuellement, les trie, puis les affiche en cards ou en liste.

---

## 8. Rôle des API serveur dans Nuxt

Le dossier [nuxt-mairie/server/api](nuxt-mairie/server/api) sert de pont entre le front et Strapi.

Les fichiers les plus importants sont :

- [nuxt-mairie/server/api/actualites.get.ts](nuxt-mairie/server/api/actualites.get.ts) : liste des actualités
- [nuxt-mairie/server/api/actualites/[slug].get.ts](nuxt-mairie/server/api/actualites/[slug].get.ts) : détail d’un article
- [nuxt-mairie/server/api/projects.get.ts](nuxt-mairie/server/api/projects.get.ts) : projets
- [nuxt-mairie/server/api/evenements.get.ts](nuxt-mairie/server/api/evenements.get.ts) : événements
- [nuxt-mairie/server/api/flash-info.get.ts](nuxt-mairie/server/api/flash-info.get.ts) : flash infos
- [nuxt-mairie/server/api/elus.get.ts](nuxt-mairie/server/api/elus.get.ts) : élus

Par convention, le front ne contacte pas Strapi directement. Il appelle plutôt l’API interne de Nuxt, qui elle-même appelle Strapi. Cela centralise les règles métier, les filtres, la sécurité et la transformation des données.

---

## 9. Gestion des médias et transformation Strapi

Le fichier [nuxt-mairie/server/utils/strapi.ts](nuxt-mairie/server/utils/strapi.ts) est très important car il est le point de normalisation entre Strapi et Nuxt.

Il gère notamment :

- les champs de média Strapi (`coverImage`, `gallery`),
- les images d’illustration et galeries,
- les URL de media locales ou cloud,
- les valeurs de fallback,
- les conversions de libellés de catégories,
- les textes d’extraits s’il manque un résumé.

Exemple : une image Strapi peut arriver sous forme d’objet complexe ; la fonction `mediaUrl()` transforme ce format brut en URL exploitable par le front.

Cela permet d’éviter de casser l’affichage si les images viennent :

- de Strapi local,
- de Cloudinary,
- d’un ancien format legacy,
- d’un payload contenant plusieurs variantes de structures.

---

## 10. Les points de cohérence à conserver

Pour éviter les régressions, il faut garder en tête ces règles de conception :

- Nuxt est le front public, il ne doit pas manipuler directement la base.
- Strapi est la source éditoriale et doit rester la source de vérité pour les contenus.
- Supabase héberge la base PostgreSQL de Strapi.
- Cloudinary stocke les médias.
- Les URL legacy ne doivent pas être la source de vérité pour les images.
- Les champs média doivent être lisibles par Nuxt sous les bonnes clés comme `coverImage`, `gallery`, `image`, etc.
- Les pages Nuxt reposent sur les fichiers du dossier [nuxt-mairie/pages](nuxt-mairie/pages) et les composants sectionnels du dossier [nuxt-mairie/components](nuxt-mairie/components).

---

## 11. Vue d’ensemble du parcours utilisateur

Un utilisateur visite le site de la manière suivante :

1. il ouvre la page d’accueil,
2. le header affiche les sections disponibles,
3. la page d’accueil charge les données de Strapi via les API internes,
4. les blocs affichent les actualités, flash infos, événements, projets,
5. si l’utilisateur clique sur une actualité, la route change vers /actualites/[slug],
6. la page détail récupère l’article associé,
7. la galerie et le contenu sont affichés,
8. la navigation reste cohérente grâce au système de routage Nuxt.

---

## 12. Fichiers clés à connaître pour reprendre le projet

Pour comprendre le projet sans ambiguïté, les fichiers les plus importants sont :

- [nuxt-mairie/nuxt.config.ts](nuxt-mairie/nuxt.config.ts)
- [nuxt-mairie/server/utils/strapi.ts](nuxt-mairie/server/utils/strapi.ts)
- [nuxt-mairie/server/api](nuxt-mairie/server/api)
- [nuxt-mairie/pages/index.vue](nuxt-mairie/pages/index.vue)
- [nuxt-mairie/pages/actualites/[slug].vue](nuxt-mairie/pages/actualites/[slug].vue)
- [nuxt-mairie/components/layout/AppHeader.vue](nuxt-mairie/components/layout/AppHeader.vue)
- [nuxt-mairie/components/home/ActualitesSection.vue](nuxt-mairie/components/home/ActualitesSection.vue)
- [strapi-admin/config/plugins.js](strapi-admin/config/plugins.js)
- [strapi-admin/src/api](strapi-admin/src/api)

---

## 13. Résumé court

- Front public : Nuxt 3
- CMS : Strapi 5
- Base : Supabase / PostgreSQL
- Médias : Cloudinary
- Rôle de Nuxt : afficher les contenus et gérer le routage du site
- Rôle de Strapi : éditer les contenus et exposer l’API
- Rôle de Supabase : stocker les données structurées
- Rôle de Cloudinary : stocker les images et les médias
- Point clé : les pages Nuxt récupèrent les données via des routes serveur internes, puis les composants affichent les blocs enrichis après transformation dans le helper Strapi.

Cette structure permet de séparer clairement les responsabilités tout en gardant un site moderne, facilement éditable et scalable.