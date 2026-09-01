// import-projets.js — Importe les projets dans Strapi 5
// Usage : node import-projets.js (depuis le dossier strapi-admin)

try { process.loadEnvFile(); } catch (e) {}

const STRAPI_BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

if (!TOKEN) {
  throw new Error('Token Strapi manquant. Définis STRAPI_TOKEN ou STRAPI_API_TOKEN dans ton environnement avant d’exécuter ce script.')
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

const projets = [
  {
    titre:         'Reconstruction du Grand Marché de Bouaké',
    resume:        'Le Grand Marché de Bouaké est le poumon économique de la ville. La reconstruction vise à en faire le plus grand marché de gros et de détail d\'Afrique de l\'Ouest, entièrement sécurisé et doté d\'une zone logistique moderne.',
    categorie:     'infrastructure',
    statut:        'en-cours',
    budget:        '12 milliards FCFA',
    progression:   45,
    featured:      true,
    coverImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Construction de la Nouvelle Gare Routière',
    resume:        'La nouvelle gare routière regroupera tous les transports interurbains dans un espace moderne, sécurisé et connecté au réseau de transport en commun de la ville.',
    categorie:     'infrastructure',
    statut:        'en-cours',
    budget:        '8,5 milliards FCFA',
    progression:   30,
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Plan de Mobilité Urbaine 2025–2030',
    resume:        'Un réseau de transport en commun moderne pour desservir tous les quartiers de Bouaké : lignes de bus structurantes, pistes cyclables et aménagements piétons sur les axes principaux.',
    categorie:     'infrastructure',
    statut:        'planifie',
    budget:        '6 milliards FCFA',
    progression:   10,
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Modernisation des Infrastructures Sanitaires',
    resume:        'Construction de 3 nouveaux centres de santé communautaires et réhabilitation complète du CHR de Bouaké. Acquisition d\'équipements médicaux de pointe pour améliorer l\'accès aux soins.',
    categorie:     'sante',
    statut:        'en-cours',
    budget:        '15 milliards FCFA',
    progression:   60,
    featured:      true,
    coverImageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Digitalisation des Taxes et Services Municipaux',
    resume:        'Paiement en ligne des taxes locales, délivrance électronique des actes administratifs et accompagnement numérique à la création d\'entreprise. Un portail unique pour tous les services de la mairie.',
    categorie:     'economie',
    statut:        'en-cours',
    budget:        '2,5 milliards FCFA',
    progression:   70,
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Construction de 10 Nouvelles Écoles Primaires',
    resume:        'Programme de construction de 10 écoles primaires dans les quartiers défavorisés de Bouaké, avec équipements numériques et cantines scolaires. Objectif : scolariser 5 000 enfants supplémentaires.',
    categorie:     'education',
    statut:        'planifie',
    budget:        '5 milliards FCFA',
    progression:   15,
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Programme de Logements Sociaux — 500 Unités',
    resume:        'Construction de 500 logements sociaux accessibles dans les quartiers périphériques de Bouaké, avec accès à l\'eau, l\'électricité et les réseaux d\'assainissement.',
    categorie:     'social',
    statut:        'planifie',
    budget:        '20 milliards FCFA',
    progression:   5,
    featured:      false,
    coverImageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80',
  },
  {
    titre:         'Aménagement de la Zone Industrielle Nord',
    resume:        'Développement d\'une zone industrielle de 200 hectares au nord de Bouaké : voiries, raccordements électriques et hydrauliques, guichet unique pour les investisseurs et incitations fiscales.',
    categorie:     'economie',
    statut:        'en-cours',
    budget:        '18 milliards FCFA',
    progression:   25,
    featured:      true,
    coverImageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
]

async function importProjet(projet) {
  const coverImageId = projet.coverImageUrl
    ? await uploadRemoteImageToStrapi(projet.coverImageUrl, `${projet.titre || Date.now()}.jpg`)
    : null

  const payload = {
    ...projet,
    ...(coverImageId ? { coverImage: coverImageId } : {}),
  }
  delete payload.coverImageUrl

  // 1. Création
  const createRes = await fetch(`${STRAPI_BASE_URL}/api/projets`, {
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
  const pubRes = await fetch(`${STRAPI_BASE_URL}/api/projets/${documentId}/actions/publish`, {
    method: 'POST',
    headers,
  })

  if (!pubRes.ok) {
    console.warn(`    ⚠️  Publication échouée pour "${projet.titre}"`)
  }

  return documentId
}

async function main() {
  console.log(`\n🏗️  Import de ${projets.length} projets...\n`)
  let success = 0, errors = 0

  for (const projet of projets) {
    try {
      await importProjet(projet)
      console.log(`  ✅  [${projet.statut}] ${projet.titre.slice(0, 65)}`)
      success++
    } catch (err) {
      console.error(`  ❌  ${projet.titre.slice(0, 45)}: ${err.message}`)
      errors++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n─────────────────────────────────────────`)
  console.log(`✅ Réussis : ${success} / ${projets.length}`)
  console.log(`❌ Erreurs : ${errors}`)
  console.log(`─────────────────────────────────────────\n`)
}

main().catch(console.error)
