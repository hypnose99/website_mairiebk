// import-depuis-prod.js — Recopie le contenu du site en ligne dans le Strapi local
//
// Récupère les actualités, événements et projets publiés sur le site de
// production (API publique du front Nuxt) et les crée dans le Strapi local,
// SANS LES IMAGES : les images de couverture et les galeries sont à ajouter
// à la main dans l'admin Strapi.
//
// Usage (depuis le dossier strapi-admin, Strapi local démarré) :
//   node import-depuis-prod.js              → importe
//   node import-depuis-prod.js --dry        → simule, n'écrit rien
//   node import-depuis-prod.js --only=projets,evenements
//   SOURCE_URL=https://autre-site.ci node import-depuis-prod.js
//
// Le script ne crée jamais deux fois le même contenu : il compare les titres
// (et les slugs pour les actualités) avec ce qui existe déjà en local.
//
// Droits nécessaires sur le jeton local (Settings → API Tokens) :
//   Actualite: find + create · Categorie-actualite: find + create
//   Evenement: find + create · Projet: find + create

try { process.loadEnvFile() } catch { /* .env optionnel */ }

const SOURCE_URL = (process.env.SOURCE_URL || 'https://www.mairiedebouake.ci').replace(/\/$/, '')
const LOCAL_URL  = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')
const TOKEN      = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

const args   = process.argv.slice(2)
const DRY    = args.includes('--dry')
const onlyAr = args.find(a => a.startsWith('--only='))
const ONLY   = onlyAr ? onlyAr.replace('--only=', '').split(',').map(s => s.trim()) : null
const wanted = (name) => !ONLY || ONLY.includes(name)

if (!TOKEN) {
  throw new Error('Token Strapi manquant : définis STRAPI_TOKEN dans strapi-admin/.env')
}
if (LOCAL_URL.includes('mairiedebouake.ci') || LOCAL_URL.includes('onrender.com')) {
  throw new Error(`Refus d'écrire sur ${LOCAL_URL} : ce script n'écrit que dans un Strapi local.`)
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

const getSource = async (path) => {
  const res = await fetch(`${SOURCE_URL}${path}`)
  if (!res.ok) throw new Error(`Source ${path} : HTTP ${res.status}`)
  return res.json()
}

const getLocal = async (path) => {
  const res = await fetch(`${LOCAL_URL}${path}`, { headers })
  if (!res.ok) throw new Error(`Local ${path} : HTTP ${res.status} — vérifie les droits du jeton`)
  return res.json()
}

/** Crée une entrée publiée dans le Strapi local. */
const createLocal = async (collection, data) => {
  if (DRY) return { documentId: '(dry-run)' }
  const res = await fetch(`${LOCAL_URL}/api/${collection}?status=published`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST ${collection} : HTTP ${res.status} — ${text.slice(0, 200)}`)
  const created = JSON.parse(text)?.data

  // Selon la version de Strapi, ?status=published n'est pas toujours pris en
  // compte à la création : on publie alors explicitement.
  if (created?.documentId && !created?.publishedAt) {
    await fetch(`${LOCAL_URL}/api/${collection}/${created.documentId}?status=published`, {
      method: 'PUT', headers, body: JSON.stringify({ data: {} }),
    }).catch(() => {})
  }
  return created
}

const norm = (v) => String(v ?? '').trim().toLowerCase()

// ── Catégories d'actualités ────────────────────────────────────────────────
async function syncCategories() {
  const source = await getSource('/api/categories-actualites')
  const local  = await getLocal('/api/categorie-actualites?pagination[limit]=100')
  const bySlug = new Map((local.data ?? []).map(c => [norm(c.slug), c]))

  for (const cat of source) {
    if (!cat?.value || bySlug.has(norm(cat.value))) continue
    console.log(`  + catégorie "${cat.label}"`)
    const created = await createLocal('categorie-actualites', {
      nom: cat.label, slug: cat.value, couleur: cat.accent || '#009640',
    })
    bySlug.set(norm(cat.value), created)
  }
  return bySlug
}

// ── Actualités ─────────────────────────────────────────────────────────────
async function importActualites(categories) {
  const list  = await getSource('/api/actualites?perPage=500&fields=list')
  const local = await getLocal('/api/actualites?pagination[limit]=500&fields[0]=title&fields[1]=slug')
  const seen  = new Set((local.data ?? []).flatMap(a => [norm(a.slug), norm(a.title)]))

  let added = 0
  for (const item of list.items ?? []) {
    if (seen.has(norm(item.slug)) || seen.has(norm(item.title))) {
      console.log(`  = déjà présent : ${item.title.slice(0, 50)}`)
      continue
    }
    // Le contenu complet n'est pas dans la liste : on charge le détail
    const detail = await getSource(`/api/actualites/${encodeURIComponent(item.slug)}`).catch(() => null)
    const categorie = categories.get(norm(item.category))

    console.log(`  + ${item.title.slice(0, 60)}`)
    await createLocal('actualites', {
      title:  item.title,
      slug:   item.slug,
      excerpt: detail?.excerpt ?? item.excerpt ?? '',
      content: detail?.content ?? undefined,
      auteur:  item.author ?? detail?.author ?? 'Service Communication',
      date_publication: item.date_publication ?? (item.publishedAt ? String(item.publishedAt).slice(0, 10) : undefined),
      featured: Boolean(item.featured),
      videoUrl: detail?.videoUrl ?? undefined,
      tags:     detail?.tags?.length ? detail.tags : undefined,
      views: 0,
      likes: 0,
      ...(categorie ? { categorie: { connect: [{ documentId: categorie.documentId }] } } : {}),
    })
    added++
  }
  return added
}

// ── Événements ─────────────────────────────────────────────────────────────
async function importEvenements() {
  const list  = await getSource('/api/evenements?perPage=200')
  const local = await getLocal('/api/evenements?pagination[limit]=200&fields[0]=titre')
  const seen  = new Set((local.data ?? []).map(e => norm(e.titre)))

  const CATS = ['culturel', 'sportif', 'politique', 'social']
  let added = 0
  for (const ev of list) {
    if (seen.has(norm(ev.titre))) { console.log(`  = déjà présent : ${ev.titre}`); continue }
    console.log(`  + ${ev.titre}`)
    await createLocal('evenements', {
      titre: ev.titre,
      description: ev.description || undefined,
      contenu: ev.contenu || undefined,
      dateDebut: ev.dateDebut || undefined,
      dateFin: ev.dateFin || undefined,
      lieu: ev.lieu || undefined,
      categorie: CATS.includes(norm(ev.categorie)) ? norm(ev.categorie) : undefined,
      featured: Boolean(ev.featured),
    })
    added++
  }
  return added
}

// ── Projets ────────────────────────────────────────────────────────────────
async function importProjets() {
  const list  = await getSource('/api/projects?perPage=200')
  const local = await getLocal('/api/projets?pagination[limit]=200&fields[0]=titre')
  const seen  = new Set((local.data ?? []).map(p => norm(p.titre)))

  const CATS    = ['infrastructure', 'social', 'education', 'sante', 'economie']
  const STATUTS = ['planifie', 'en-cours', 'termine']
  let added = 0
  for (const p of list) {
    if (seen.has(norm(p.title))) { console.log(`  = déjà présent : ${p.title}`); continue }
    const statut = norm(p.status).replace(/_/g, '-')
    console.log(`  + ${p.title}`)
    await createLocal('projets', {
      titre: p.title,
      resume: p.resume || p.description || undefined,
      contenu: p.content || undefined,
      categorie: CATS.includes(norm(p.category)) ? norm(p.category) : undefined,
      statut: STATUTS.includes(statut) ? statut : undefined,
      budget: p.budget || undefined,
      dateDebut: p.dateDebut || undefined,
      dateFin: p.dateFin || undefined,
      maitreOuvrage: p.maitreOuvrage || undefined,
      bailleur: p.bailleurs || p.financement || undefined,
      progression: Number(p.progressPercent) || 0,
      featured: Boolean(p.featured),
    })
    added++
  }
  return added
}

async function main() {
  console.log('=== Import depuis la production (sans les images) ===')
  console.log('Source      :', SOURCE_URL)
  console.log('Destination :', LOCAL_URL)
  if (DRY) console.log('Mode        : simulation (--dry), rien ne sera écrit')
  console.log('')

  let categories = new Map()
  if (wanted('actualites')) {
    console.log('Catégories…')
    categories = await syncCategories()
  }

  const totals = {}
  if (wanted('actualites')) { console.log('\nActualités…'); totals.actualites = await importActualites(categories) }
  if (wanted('evenements')) { console.log('\nÉvénements…'); totals.evenements = await importEvenements() }
  if (wanted('projets'))    { console.log('\nProjets…');    totals.projets    = await importProjets() }

  console.log('\n=== Terminé ===')
  for (const [k, v] of Object.entries(totals)) console.log(`  ${k} : ${v} créé(s)`)
  console.log('\nLes images ne sont pas importées : ajoutez-les dans Strapi')
  console.log('(Content Manager → ouvrir l\'entrée → champ image / galerie).')
}

main().catch((err) => {
  console.error('\n❌ Import interrompu :', err.message)
  process.exit(1)
})
