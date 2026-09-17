'use strict';

/**
 * commentaire router
 *
 * Seules la lecture (commentaires publiés) et la création (brouillon) sont
 * exposées par l'API. Modification et suppression se font dans l'admin Strapi.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::commentaire.commentaire', {
  only: ['find', 'create'],
});
