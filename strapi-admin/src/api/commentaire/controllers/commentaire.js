'use strict';

/**
 * commentaire controller
 *
 * Modération : un commentaire envoyé depuis le site est TOUJOURS créé en
 * brouillon. Il n'est visible publiquement (GET /api/commentaires) qu'après
 * publication par un éditeur dans le Content Manager de Strapi.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const clean = (value, max) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, '')   // pas de HTML
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

module.exports = createCoreController('api::commentaire.commentaire', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request.body?.data ?? {};
    const nom = clean(body.nom, 60);
    const texte = String(body.texte ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 1000);
    const actualiteId = String(body.actualite ?? '').trim();

    if (nom.length < 2 || texte.length < 3 || !actualiteId) {
      return ctx.badRequest('Nom, commentaire et article sont obligatoires.');
    }

    const article = await strapi.documents('api::actualite.actualite').findOne({
      documentId: actualiteId,
      status: 'published',
    });
    if (!article) return ctx.notFound('Article introuvable');

    // Seuls ces champs sont enregistrés, et toujours en brouillon.
    const created = await strapi.documents('api::commentaire.commentaire').create({
      data: {
        nom,
        texte,
        actualite: { connect: [{ documentId: actualiteId }] },
      },
      status: 'draft',
    });

    ctx.status = 201;
    return { data: { documentId: created.documentId, moderation: true } };
  },
}));
