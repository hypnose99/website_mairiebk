// import-evenements.js — Importe les événements dans Strapi 5
// Usage : node import-evenements.js (depuis le dossier strapi-admin)
try { process.loadEnvFile(); } catch (e) {}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN      = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

if (!TOKEN) {
  throw new Error('Token Strapi manquant. Définis STRAPI_TOKEN ou STRAPI_API_TOKEN dans ton environnement avant dexécuter ce script.')
}

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

const evenements = [
  {
    titre:         'Festival de la Paix de Bouaké 2026',
    description:   'Grand concert de la paix au stade municipal de Bouaké. Artistes locaux et internationaux réunis pour célébrer la cohésion sociale.',
    dateDebut:     '2026-10-12T18:00:00.000Z',
    dateFin:       '2026-10-14',
    lieu:          'Stade Municipal de Bouaké',
    categorie:     'culturel',
    featured:      true,
    coverImageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Marathon de Bouaké 2026',
    description:   'Inscriptions ouvertes pour la 5ème édition du Marathon de Bouaké. Parcours de 42 km et 10 km ouverts à tous les niveaux.',
    dateDebut:     '2026-11-15T07:00:00.000Z',
    dateFin:       '2026-11-15',
    lieu:          'Place de la Mairie, Bouaké',
    categorie:     'sportif',
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Forum Économique de Bouaké',
    description:   'Rencontre annuelle des entrepreneurs locaux, investisseurs et partenaires institutionnels. Thème 2026 : Bouaké, hub commercial de l\'Afrique de l\'Ouest.',
    dateDebut:     '2026-12-01T09:00:00.000Z',
    dateFin:       '2026-12-02',
    lieu:          'Palais de la Culture de Bouaké',
    categorie:     'social',
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Journée Portes Ouvertes — Mairie de Bouaké',
    description:   'La mairie ouvre ses portes aux citoyens pour présenter ses services, ses projets en cours et répondre à toutes vos questions.',
    dateDebut:     '2026-07-15T08:00:00.000Z',
    dateFin:       '2026-07-15',
    lieu:          'Hôtel de Ville, Bouaké',
    categorie:     'politique',
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Tournoi de Football Inter-Quartiers',
    description:   'Compétition sportive regroupant les équipes des 12 quartiers de Bouaké. Finale le 20 août au stade municipal.',
    dateDebut:     '2026-08-05T15:00:00.000Z',
    dateFin:       '2026-08-20',
    lieu:          'Stade Municipal de Bouaké',
    categorie:     'sportif',
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Cérémonie de remise des diplômes — Université Alassane Ouattara',
    description:   'La mairie participe à la cérémonie de remise des diplômes de l\'Université Alassane Ouattara de Bouaké, promotion 2025–2026.',
    dateDebut:     '2026-09-10T10:00:00.000Z',
    dateFin:       '2026-09-10',
    lieu:          'Université Alassane Ouattara, Bouaké',
    categorie:     'social',
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  },
]

async function importEvenement(ev) {
  const coverImageId = ev.coverImageUrl
    ? await uploadRemoteImageToStrapi(ev.coverImageUrl, `${ev.titre || Date.now()}.jpg`)
    : null

  const payload = {
    ...ev,
    ...(coverImageId ? { coverImage: coverImageId } : {}),
  }
  delete payload.coverImageUrl

  // 1. Création
  const createRes = await fetch(`${STRAPI_BASE_URL}/api/evenements`, {
    method:  'POST',
    headers,
    body: JSON.stringify({ data: payload }),
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
  const pubRes = await fetch(`${STRAPI_BASE_URL}/api/evenements/${documentId}/actions/publish`, {
    method: 'POST',
    headers,
  })

  if (!pubRes.ok) {
    console.warn(`    ⚠️  Publication échouée pour "${ev.titre}", reste en draft`)
  }

  return documentId
}

async function main() {
  console.log(`\n📅 Import de ${evenements.length} événements...\n`)
  let success = 0, errors = 0

  for (const ev of evenements) {
    try {
      await importEvenement(ev)
      const date = new Date(ev.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      console.log(`  ✅  [${date}] ${ev.titre}`)
      success++
    } catch (err) {
      console.error(`  ❌  ${ev.titre}: ${err.message}`)
      errors++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n─────────────────────────────────────────`)
  console.log(`✅ Réussis : ${success} / ${evenements.length}`)
  console.log(`❌ Erreurs : ${errors}`)
  console.log(`─────────────────────────────────────────\n`)
}

main().catch(console.error)
