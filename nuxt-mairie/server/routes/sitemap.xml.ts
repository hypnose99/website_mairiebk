// server/routes/sitemap.xml.ts — Plan du site pour les moteurs de recherche
//
// Généré à la demande depuis Strapi : chaque nouvel article ou projet publié
// y apparaît automatiquement, sans redéploiement. Adresse : /sitemap.xml
// (déclarée dans public/robots.txt et à envoyer dans Google Search Console).
import { strapiFetchRange } from '~/server/utils/strapi'

interface Entry { loc: string; lastmod?: string; changefreq: string; priority: string }

/** Pages fixes du site. */
const STATIC_PAGES: Array<[string, string, string]> = [
  ['/',              'daily',   '1.0'],
  ['/actualites',    'daily',   '0.9'],
  ['/projets',       'weekly',  '0.8'],
  ['/services',      'monthly', '0.8'],
  ['/elus',          'monthly', '0.7'],
  ['/opportunites',  'weekly',  '0.7'],
]

const xmlEscape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const isoDate = (value: unknown) => {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const base = String(config.public.siteUrl || 'https://www.mairiedebouake.ci').replace(/\/$/, '')

  const entries: Entry[] = STATIC_PAGES.map(([path, changefreq, priority]) => ({
    loc: `${base}${path}`, changefreq, priority,
  }))

  // Articles publiés
  try {
    const params = new URLSearchParams()
    params.append('fields[0]', 'slug')
    params.append('fields[1]', 'title')
    params.append('fields[2]', 'updatedAt')
    params.append('fields[3]', 'date_publication')
    params.append('sort[0]', 'date_publication:desc')
    const { items } = await strapiFetchRange('actualites', params, { start: 0, limit: 2000 })
    for (const article of items) {
      const slug = article.slug || article.documentId
      if (!slug) continue
      entries.push({
        loc: `${base}/actualites/${encodeURIComponent(slug)}`,
        lastmod: isoDate(article.updatedAt ?? article.date_publication),
        changefreq: 'monthly',
        priority: '0.7',
      })
    }
  }
  catch (err: any) {
    console.error('[sitemap] actualités indisponibles :', err?.statusCode ?? err?.message)
  }

  // Projets publiés
  try {
    const params = new URLSearchParams()
    params.append('fields[0]', 'titre')
    params.append('fields[1]', 'updatedAt')
    const { items } = await strapiFetchRange('projets', params, { start: 0, limit: 500 })
    for (const projet of items) {
      if (!projet.documentId) continue
      entries.push({
        loc: `${base}/projets/${projet.documentId}`,
        lastmod: isoDate(projet.updatedAt),
        changefreq: 'monthly',
        priority: '0.6',
      })
    }
  }
  catch (err: any) {
    console.error('[sitemap] projets indisponibles :', err?.statusCode ?? err?.message)
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `
    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=600')
  return body
})
