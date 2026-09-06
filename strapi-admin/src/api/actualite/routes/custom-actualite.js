'use strict';

// Pas de `auth: false` ici : ces routes exigent le jeton API Strapi standard,
// comme le reste du CRUD `actualite`. Le backend Nuxt envoie déjà ce jeton
// (voir server/api/actualites/[slug]/{like,view}.*.ts) — seul un appel direct
// et non authentifié à Strapi serait désormais bloqué.
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/actualites/:id/view',
      handler: 'actualite.incrementView',
    },
    {
      method: 'POST',
      path: '/actualites/:id/like',
      handler: 'actualite.incrementLike',
    },
    {
      method: 'DELETE',
      path: '/actualites/:id/like',
      handler: 'actualite.decrementLike',
    },
  ],
};
