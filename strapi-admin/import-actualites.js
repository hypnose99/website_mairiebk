// import-actualites.js — Importe les articles JSON dans Strapi 5
// Usage : node import-actualites.js (depuis le dossier strapi-admin)

try { process.loadEnvFile(); } catch (e) {}

const fs   = require('fs')
const path = require('path')

const STRAPI_BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

if (!TOKEN) {
  throw new Error('Token Strapi manquant. Définis STRAPI_TOKEN ou STRAPI_API_TOKEN dans ton environnement avant d’exécuter ce script.')
}

const articlesPath = path.join(__dirname, '../nuxt-mairie/data/actualites.json')
const articles     = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'))

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type':  'application/json',
}

async function uploadRemoteImageToStrapi(url, fileName) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Téléchargement impossible: ${url}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const fileBlob = new Blob([buffer], { type: response.headers.get('content-type') || 'image/jpeg' })
  const form = new FormData()
  form.append('files', fileBlob, fileName)

  const uploadRes = await fetch(`${STRAPI_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  })

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '')
    throw new Error(`Upload Strapi impossible: ${text.slice(0, 250)}`)
  }

  const data = await uploadRes.json()
  return data[0]?.id ?? null
}

async function importArticle(article) {
  const coverImageId = article.coverImage
    ? await uploadRemoteImageToStrapi(article.coverImage, `${article.slug || article.id}.jpg`)
    : null

  const data = {
    title:         article.title,
    slug:          article.slug,
    excerpt:       article.excerpt,
    content:       article.content,
    category:      article.category,
    auteur:        article.author ?? 'Service Communication',
    featured:      article.featured ?? false,
    videoUrl:      article.videoUrl ?? null,
    ...(coverImageId ? { coverImage: coverImageId } : {}),
  }

  // 1. Création du draft
  const createRes = await fetch(`${STRAPI_BASE_URL}/api/actualites`, {
    method:  'POST',
    headers,
    body: JSON.stringify({ data }),
  })

  if (!createRes.ok) {
    const err = await createRes.json()
    const msg = err?.error?.details?.errors?.[0]?.message
            ?? err?.error?.message
            ?? JSON.stringify(err).slice(0, 200)
    throw new Error(msg)
  }

  const created    = await createRes.json()
  const documentId = created.data?.documentId
  if (!documentId) throw new Error('documentId manquant')

  // 2. Publication
  const pubRes = await fetch(`${STRAPI_BASE_URL}/api/actualites/${documentId}/actions/publish`, {
    method: 'POST',
    headers,
  })

  if (!pubRes.ok) {
    await fetch(`${STRAPI_BASE_URL}/api/actualites/${documentId}`, {
      method:  'PUT',
      headers,
      body: JSON.stringify({ data: { publishedAt: article.publishedAt } }),
    })
  }

  return documentId
}

async function main() {
  console.log(`\n🚀 Import de ${articles.length} articles vers Strapi...\n`)

  let success = 0
  let errors  = 0

  for (const article of articles) {
    try {
      await importArticle(article)
      console.log(`  ✅  ${article.title.slice(0, 65)}`)
      success++
    } catch (err) {
      console.error(`  ❌  ${article.title.slice(0, 45)}: ${err.message.slice(0, 150)}`)
      errors++
    }
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n─────────────────────────────────────────`)
  console.log(`✅ Réussis : ${success} / ${articles.length}`)
  console.log(`❌ Erreurs : ${errors}`)
  console.log(`─────────────────────────────────────────\n`)
  if (success === articles.length) {
    console.log('🎉 Import complet ! Supprime le token "Import Script" dans Strapi.')
  }
}

main().catch(console.error)
