'use strict';

/**
 * actualite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::actualite.actualite', ({ strapi }) => ({
	// `views` et `likes` ne doivent être modifiés que via incrementView/incrementLike/decrementLike
	// ci-dessous (delta de ±1), jamais via une édition directe (Content Manager, API, script...).
	async update(ctx) {
		if (ctx.request.body?.data) {
			delete ctx.request.body.data.views;
			delete ctx.request.body.data.likes;
		}
		return super.update(ctx);
	},

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
		return this.updateCounter(ctx, 'views', 1);
	},

	async incrementLike(ctx) {
		return this.updateCounter(ctx, 'likes', 1);
	},

	async decrementLike(ctx) {
		return this.updateCounter(ctx, 'likes', -1);
	},

	async updateCounter(ctx, field, delta) {
		if (!['views', 'likes'].includes(field)) return ctx.badRequest('Compteur invalide');

		const article = await this.findByIdentifier(ctx.params.id);
		if (!article) return ctx.notFound('Article introuvable');

		const currentValue = Number(article[field]) || 0;
		const updatedDocument = await strapi.documents('api::actualite.actualite').update({
			documentId: article.documentId,
			status: 'published',
			data: { [field]: Math.max(0, currentValue + delta) },
		});

		ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		ctx.set('Pragma', 'no-cache');
		ctx.set('Expires', '0');

		return ctx.send({
			views: Number(updatedDocument.views ?? article.views) || 0,
			likes: Number(updatedDocument.likes ?? article.likes) || 0,
		});
	},
}));
