// import-flash-infos.js — Recopie les flash infos de la production dans le Strapi local
//
// Complete import-depuis-prod.js, qui ne traite pas ce type de contenu.
// Les entrees sont creees publiees. Relancable sans risque : une flash info dont
// le titre existe deja est ignoree.
//
// Usage (depuis le dossier strapi-admin, Strapi local demarre) :
//   node import-flash-infos.js --dry   → affiche ce qui serait cree, n'ecrit rien
//   node import-flash-infos.js
//
// Droits necessaires sur le jeton local : Flash-info → find + create

try { process.loadEnvFile() } catch { /* .env optionnel */ }

const SOURCE_URL = (process.env.SOURCE_URL || 'https://www.mairiedebouake.ci').replace(/\/$/, '')
const LOCAL_URL  = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')
const TOKEN      = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

const DRY = process.argv.slice(2).includes('--dry')

if (!TOKEN) {
  throw new Error('Jeton Strapi manquant : definis STRAPI_TOKEN dans strapi-admin/.env')
}
if (LOCAL_URL.includes('mairiedebouake.ci') || LOCAL_URL.includes('onrender.com')) {
  throw new Error(`Refus d'ecrire sur ${LOCAL_URL} : ce script n'ecrit que dans un Strapi local.`)
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
const norm = (v) => String(v ?? '').trim().toLowerCase()

const main = async () => {
  // --- Source : l'API publique du site en ligne ---
  const res = await fetch(`${SOURCE_URL}/api/flash-info`)
  if (!res.ok) throw new Error(`Source /api/flash-info : HTTP ${res.status}`)
  const source = await res.json()
  const entrees = Array.isArray(source) ? source : (source.items || source.data || [])
  console.log(`Source : ${entrees.length} flash info(s) sur ${SOURCE_URL}`)

  // --- Existant en local, pour ne pas creer de doublon ---
  const resLocal = await fetch(`${LOCAL_URL}/api/flash-infos?pagination[limit]=200&status=published`, { headers })
  if (!resLocal.ok) {
    throw new Error(`Local : HTTP ${resLocal.status} — verifie les droits find sur Flash-info`)
  }
  const local = await resLocal.json()
  const dejaLa = new Set((local.data || []).map((e) => norm(e.titre)))

  let crees = 0
  let ignores = 0

  for (const e of entrees) {
    if (dejaLa.has(norm(e.titre))) {
      ignores++
      continue
    }

    // Seuls les champs declares dans schema.json : titre, contenu, type, actif.
    const data = {
      titre:   e.titre,
      contenu: e.contenu,
      type:    e.type || 'info',
      actif:   e.actif !== false,
    }

    if (DRY) {
      console.log(`  [simulation] creerait : ${data.titre}`)
      crees++
      continue
    }

    const r = await fetch(`${LOCAL_URL}/api/flash-infos?status=published`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    })
    const texte = await r.text()
    if (!r.ok) {
      console.error(`  echec "${data.titre}" : HTTP ${r.status} — ${texte.slice(0, 250)}`)
      continue
    }

    // draft & publish : selon la version de Strapi, ?status=published n'est pas
    // toujours pris en compte a la creation. On publie explicitement si besoin.
    let cree = null
    try { cree = JSON.parse(texte).data } catch { /* reponse inattendue */ }
    if (cree?.documentId && !cree?.publishedAt) {
      await fetch(`${LOCAL_URL}/api/flash-infos/${cree.documentId}?status=published`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data: {} }),
      })
    }

    console.log(`  cree : ${data.titre}`)
    crees++
  }

  console.log(`\n=== Termine ===`)
  console.log(`  flash infos : ${crees} ${DRY ? 'a creer' : 'cree(s)'}, ${ignores} deja presente(s)`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
