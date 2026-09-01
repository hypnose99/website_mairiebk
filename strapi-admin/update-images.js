try { process.loadEnvFile(); } catch (e) {}
// update-images.js — Migre les anciennes URLs vers les champs médias Strapi
// Usage : node update-images.js (depuis le dossier strapi-admin)
// Ce script télécharge les anciennes URLs, les upload dans Strapi, puis affecte le media field
// `coverImage` pour les actualités, `image` pour les événements et les projets.

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

if (!TOKEN) {
  throw new Error('Token Strapi manquant. Définis STRAPI_TOKEN ou STRAPI_API_TOKEN dans ton environnement avant d’exécuter ce script.')
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${url} -> ${res.status}: ${text.slice(0, 250)}`)
  }
  return res.json()
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

  const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
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

async function updateEntry(collectionName, documentId, fieldName, uploadedId) {
  const endpoint = `${STRAPI_URL}/api/${collectionName}/${documentId}`
  const payload = {
    data: {
      [fieldName]: uploadedId,
      coverImageUrl: null,
      imageUrl: null,
    },
  }

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text().catch(() => '')
    throw new Error(`${collectionName}/${documentId} -> ${error.slice(0, 200)}`)
  }
}

async function migrateActualites() {
  const { data } = await fetchJson(`${STRAPI_URL}/api/actualites?populate=*&pagination[pageSize]=100`)

  for (const item of data) {
    const legacyUrl = item.coverImageUrl || item.coverImage?.url || null
    if (!legacyUrl || item.coverImage) continue

    try {
      const uploadedId = await uploadRemoteImageToStrapi(legacyUrl, `${item.slug || item.documentId}.jpg`)
      if (!uploadedId) continue
      await updateEntry('actualites', item.documentId, 'coverImage', uploadedId)
      console.log(`✅ actualite: ${item.title || item.slug}`)
    } catch (error) {
      console.error(`❌ actualite: ${item.title || item.slug} => ${error.message}`)
    }
  }
}

async function migrateEvents() {
  const { data } = await fetchJson(`${STRAPI_URL}/api/evenements?populate=*&pagination[pageSize]=100`)

  for (const item of data) {
    const legacyUrl = item.coverImageUrl || item.image?.url || null
    if (!legacyUrl || item.image) continue

    try {
      const uploadedId = await uploadRemoteImageToStrapi(legacyUrl, `${item.slug || item.documentId}.jpg`)
      if (!uploadedId) continue
      await updateEntry('evenements', item.documentId, 'image', uploadedId)
      console.log(`✅ evenement: ${item.titre || item.slug}`)
    } catch (error) {
      console.error(`❌ evenement: ${item.titre || item.slug} => ${error.message}`)
    }
  }
}

async function migrateProjects() {
  const { data } = await fetchJson(`${STRAPI_URL}/api/projets?populate=*&pagination[pageSize]=100`)

  for (const item of data) {
    const legacyUrl = item.coverImageUrl || item.image?.url || null
    if (!legacyUrl || item.image) continue

    try {
      const uploadedId = await uploadRemoteImageToStrapi(legacyUrl, `${item.slug || item.documentId}.jpg`)
      if (!uploadedId) continue
      await updateEntry('projets', item.documentId, 'image', uploadedId)
      console.log(`✅ projet: ${item.titre || item.slug}`)
    } catch (error) {
      console.error(`❌ projet: ${item.titre || item.slug} => ${error.message}`)
    }
  }
}

async function main() {
  console.log('\n🧭 Migration des anciennes images vers les champs media Strapi...\n')
  await migrateActualites()
  await migrateEvents()
  await migrateProjects()
  console.log('\n✅ Migration terminée. Vérifie dans Strapi que les champs `coverImage` / `image` sont maintenant remplis.')
}

main().catch((error) => {
  console.error('Erreur globale:', error)
  process.exit(1)
})
