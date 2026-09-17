// server/api/actualites/[slug]/commentaires.get.ts — Commentaires publiés d'un article
//
// Strapi ne renvoie que les commentaires PUBLIÉS (validés par la mairie).
// Le paramètre accepte le documentId ou le slug de l'article.
import { strapiFetchRange } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'slug')
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  const params = new URLSearchParams()
  params.append('filters[$or][0][actualite][documentId][$eq]', identifier)
  params.append('filters[$or][1][actualite][slug][$eq]', identifier)
  params.append('fields[0]', 'nom')
  params.append('fields[1]', 'texte')
  params.append('fields[2]', 'publishedAt')
  params.append('fields[3]', 'createdAt')
  params.append('sort[0]', 'createdAt:desc')

  try {
    const { items, total } = await strapiFetchRange('commentaires', params, { start: 0, limit: 200 })
    return {
      total,
      items: items.map((c: any) => ({
        id:   c.documentId ?? String(c.id),
        name: c.nom ?? '',
        text: c.texte ?? '',
        date: c.createdAt ?? c.publishedAt ?? null,
      })),
    }
  }
  catch (err: any) {
    console.error('[api/commentaires] Strapi error:', err?.statusCode ?? err?.message)
    return { total: 0, items: [] }
  }
})
