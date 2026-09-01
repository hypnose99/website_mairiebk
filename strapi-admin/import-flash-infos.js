// import-flash-infos.js — Importe les flash infos dans Strapi 5
// Usage : node import-flash-infos.js (depuis le dossier strapi-admin)

const STRAPI_URL = 'http://localhost:1337'
const TOKEN      = 'd691a634b54b6e4239b4bfa54647a918e9a683d4f81d203359af414452c26d1e0d6fdf634d89f4a50d2602661f1253d20db7fcc1dfdcb458dba192cffd10f0448494a8d0adb92f9dcab61336e285cdf9b148ae93a3b58703d613441035debb8faefff0d9cf62b9b9499cf64caafd1c8457b49ba0cc03f4810b56214fc11b769c'

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type':  'application/json',
}

const flashInfos = [
  {
    titre:   'Travaux rue du Commerce',
    contenu: 'Fermeture temporaire de la rue du Commerce du 5 au 20 juillet pour travaux de réfection de chaussée. Déviation par l\'avenue Houphouët-Boigny.',
    type:    'travaux',
    actif:   true,
  },
  {
    titre:   'Résultats bourses municipales 2026',
    contenu: 'Les résultats des bourses d\'études municipales 2026 sont disponibles. Consultez la liste des bénéficiaires à l\'accueil de la mairie ou sur ce portail.',
    type:    'info',
    actif:   true,
  },
  {
    titre:   'Coupure d\'eau quartier Air France',
    contenu: 'Une interruption de la distribution d\'eau est prévue le 8 juillet de 8h à 16h dans le quartier Air France pour maintenance du réseau SODECI.',
    type:    'alerte',
    actif:   true,
  },
  {
    titre:   'Inscription état civil — nouveaux horaires',
    contenu: 'Le service état civil est désormais ouvert du lundi au vendredi de 7h30 à 16h00 sans interruption. Fermeture le samedi.',
    type:    'info',
    actif:   true,
  },
  {
    titre:   'Appel à candidatures — Conseil municipal jeunes',
    contenu: 'La mairie de Bouaké lance un appel à candidatures pour le Conseil Municipal des Jeunes 2026–2028. Dépôt des dossiers jusqu\'au 31 juillet.',
    type:    'info',
    actif:   true,
  },
]

async function importFlashInfo(flash) {
  // 1. Création
  const createRes = await fetch(`${STRAPI_URL}/api/flash-infos`, {
    method:  'POST',
    headers,
    body: JSON.stringify({ data: flash }),
  })

  if (!createRes.ok) {
    const err = await createRes.json()
    throw new Error(err?.error?.message ?? JSON.stringify(err).slice(0, 200))
  }

  const created    = await createRes.json()
  const documentId = created.data?.documentId
  if (!documentId) throw new Error('documentId manquant')

  // 2. Publication
  await fetch(`${STRAPI_URL}/api/flash-infos/${documentId}/actions/publish`, {
    method: 'POST',
    headers,
  })

  return documentId
}

async function main() {
  console.log(`\n⚡ Import de ${flashInfos.length} flash infos...\n`)
  let success = 0, errors = 0

  for (const flash of flashInfos) {
    try {
      await importFlashInfo(flash)
      console.log(`  ✅  [${flash.type.toUpperCase()}] ${flash.titre}`)
      success++
    } catch (err) {
      console.error(`  ❌  ${flash.titre}: ${err.message}`)
      errors++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n─────────────────────────────────────────`)
  console.log(`✅ Réussis : ${success} / ${flashInfos.length}`)
  console.log(`❌ Erreurs : ${errors}`)
  console.log(`─────────────────────────────────────────\n`)
}

main().catch(console.error)
