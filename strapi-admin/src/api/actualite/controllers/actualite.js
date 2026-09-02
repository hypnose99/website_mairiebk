'use strict';

/**
 * actualite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::actualite.actualite', ({ strapi }) => ({
	async findByIdentifier(identifier) {
		const documents = strapi.documents('api::actualite.actualite');
		const byDocumentId = await documents.findOne({ documentId: identifier });
		if (byDocumentId) return byDocumentId;

		const bySlug = await documents.findMany({
			filters: { slug: identifier },
			limit: 1,
		});
		if (bySlug[0]) return bySlug[0];

		return null;
	},

	async incrementView(ctx) {
		const identifier = ctx.params.identifier;
		const article = await this.findByIdentifier(identifier);
		if (!article) return ctx.notFound('Article introuvable');

		const updated = await strapi.documents('api::actualite.actualite').update({
			documentId: article.documentId,
			data: { views: Math.max(0, Number(article.views) || 0) + 1 },
		});

		return { views: updated.views ?? 0 };
	},

	async incrementLike(ctx) {
		const identifier = ctx.params.identifier;
		const article = await this.findByIdentifier(identifier);
		if (!article) return ctx.notFound('Article introuvable');

		const updated = await strapi.documents('api::actualite.actualite').update({
			documentId: article.documentId,
			data: { likes: Math.max(0, Number(article.likes) || 0) + 1 },
		});

		return { likes: updated.likes ?? 0 };
	},

	async decrementLike(ctx) {
		const identifier = ctx.params.identifier;
		const article = await this.findByIdentifier(identifier);
		if (!article) return ctx.notFound('Article introuvable');

		const updated = await strapi.documents('api::actualite.actualite').update({
			documentId: article.documentId,
			data: { likes: Math.max(0, (Number(article.likes) || 0) - 1) },
		});

		return { likes: updated.likes ?? 0 };
	},
}));
