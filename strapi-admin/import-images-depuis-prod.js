// import-images-depuis-prod.js — Rapatrie les images du site en ligne dans le Strapi local
//
// Complète import-depuis-prod.js, qui crée les contenus sans leurs images.
// Les visuels de production sont sur le Cloudinary du site en ligne ; ce script
// les télécharge et les ré-uploade dans le Strapi local, qui les pousse vers
// son propre Cloudinary (compte distinct) avant de les rattacher aux entrées.
//
// Usage (depuis le dossier strapi-admin, Strapi local démarré) :
//   node import-images-depuis-prod.js --dry       → vérifie les URLs, n'écrit rien
//   node import-images-depuis-prod.js             → couvertures uniquement
//   node import-images-depuis-prod.js --galeries  → couvertures + galeries
//   node import-images-depuis-prod.js --only=projets,evenements
//   node import-images-depuis-prod.js --force     → remplace les images déjà en place
//   node import-images-depuis-prod.js --sans-placeholders → ignore les images
//                                       externes (Unsplash & co), ne prend que Cloudinary
//
// Relançable sans risque : une entrée dont le champ média est déjà rempli est
// sautée, sauf avec --force.
//
// Droits nécessaires sur le jeton local (Settings → API Tokens) :
//   Actualite / Evenement / Projet : find + update
//   Section Upload : upload

try { process.loadEnvFile() } catch { /* .env optionnel */ }

const SOURCE_URL = (process.env.SOURCE_URL || 'https://www.mairiedebouake.ci').replace(/\/$/, '')
const LOCAL_URL  = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')
const TOKEN      = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

const args    = process.argv.slice(2)
const DRY     = args.includes('--dry')
const FORCE   = args.includes('--force')
const GALERIES = args.includes('--galeries')
const SANS_PLACEHOLDERS = args.includes('--sans-placeholders')
const onlyArg = args.find(a => a.startsWith('--only='))
const ONLY    = onlyArg ? onlyArg.replace('--only=', '').split(',').map(s => s.trim()) : null
const wanted  = (name) => !ONLY || ONLY.includes(name)

if (!TOKEN) {
  throw new Error('Token Strapi manquant : définis STRAPI_TOKEN dans strapi-admin/.env')
}
if (LOCAL_URL.includes('mairiedebouake.ci') || LOCAL_URL.includes('onrender.com')) {
  throw new Error(`Refus d'écrire sur ${LOCAL_URL} : ce script n'écrit que dans un Strapi local.`)
}

const headers = { Authorization: `Bearer ${TOKEN}` }
const norm = (v) => String(v ?? '').trim().toLowerCase()

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

/** Une partie des visuels de production sont des photos de stock externes
 *  (Unsplash) et non de vraies images communales hébergées sur Cloudinary. */
const estPlaceholder = (url) => !url.includes('res.cloudinary.com')

/** Respiration entre deux transferts, pour ne pas déclencher les limitations. */
const pause = (ms = 250) => new Promise(r => setTimeout(r, ms))

/** Une réponse 4xx est un verdict : la réessayer ne changera rien, contrairement
 *  à un échec réseau qui est lui transitoire. */
const erreurDefinitive = (message) => Object.assign(new Error(message), { definitif: true })

/** Unsplash et Cloudinary coupent les rafales de requêtes : un échec réseau
 *  n'est pas forcément une URL invalide, on réessaie avant de conclure. */
const avecReessai = async (fn, label, essais = 3) => {
  for (let n = 1; ; n++) {
    try {
      return await fn()
    } catch (err) {
      if (err.definitif || n >= essais) throw err
      const pause = n * 1500
      console.log(`    …échec réseau sur "${label}", nouvelle tentative dans ${pause} ms`)
      await new Promise(r => setTimeout(r, pause))
    }
  }
}

/** Télécharge une image de production et l'uploade dans le Strapi local. */
const transferImage = async (url) => {
  const name = decodeURIComponent((url.split('/').pop() || 'image.jpg').split('?')[0])

  const dl = await fetch(url)
  if (!dl.ok) {
    const msg = `téléchargement ${name} : HTTP ${dl.status}`
    throw dl.status < 500 ? erreurDefinitive(msg) : new Error(msg)
  }
  const type = dl.headers.get('content-type') || 'image/jpeg'
  const bytes = Buffer.from(await dl.arrayBuffer())

  const form = new FormData()
  form.append('files', new Blob([bytes], { type }), name)

  // Pas de Content-Type manuel : fetch doit générer lui-même la frontière multipart.
  const up = await fetch(`${LOCAL_URL}/api/upload`, { method: 'POST', headers, body: form })
  const text = await up.text()
  if (!up.ok) {
    const msg = `upload ${name} : HTTP ${up.status} — ${text.slice(0, 200)}`
    throw up.status < 500 ? erreurDefinitive(msg) : new Error(msg)
  }

  const files = JSON.parse(text)
  const id = Array.isArray(files) ? files[0]?.id : files?.id
  if (!id) throw new Error(`upload ${name} : réponse sans id — ${text.slice(0, 200)}`)
  return { id, ko: Math.round(bytes.length / 1024) }
}

/** Rattache un média (ou une liste) à une entrée, sur la version publiée. */
const linkMedia = async (collection, documentId, field, value) => {
  const res = await fetch(`${LOCAL_URL}/api/${collection}/${documentId}?status=published`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { [field]: value } }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`PUT ${collection}/${documentId} : HTTP ${res.status} — ${text.slice(0, 200)}`)
}

/** En simulation, on se contente de vérifier que l'URL répond. */
const checkUrl = async (url) => {
  const res = await fetch(url, { method: 'HEAD' })
  return res.ok
}

// Les noms de champs média diffèrent d'une collection à l'autre : la définition
// de chaque collection dit où lire côté production et où écrire côté local.
const COLLECTIONS = {
  actualites: {
    localPath: 'actualites',
    localFields: 'fields[0]=title&fields[1]=slug',
    coverField: 'coverImage',
    galleryField: 'gallery',
    localKeys: (e) => [norm(e.slug), norm(e.title)],
    sourceKeys: (i) => [norm(i.slug), norm(i.title)],
    sourceList: async () => (await getSource('/api/actualites?perPage=500&fields=list')).items ?? [],
    sourceLabel: (i) => i.title,
    sourceCover: (i) => i.coverImage || null,
    // fields=list retire le contenu et la galerie : il faut le détail pour la galerie.
    sourceGallery: async (i) => {
      const d = await getSource(`/api/actualites/${encodeURIComponent(i.slug)}`).catch(() => null)
      return (d?.gallery ?? []).map(g => g?.url).filter(Boolean)
    },
  },
  evenements: {
    localPath: 'evenements',
    localFields: 'fields[0]=titre',
    coverField: 'image',
    galleryField: null,
    localKeys: (e) => [norm(e.titre)],
    sourceKeys: (e) => [norm(e.titre)],
    sourceList: async () => await getSource('/api/evenements?perPage=200'),
    sourceLabel: (e) => e.titre,
    sourceCover: (e) => e.image || e.coverImage || null,
    sourceGallery: async () => [],
  },
  projets: {
    localPath: 'projets',
    localFields: 'fields[0]=titre',
    coverField: 'image',
    galleryField: 'galerie',
    localKeys: (e) => [norm(e.titre)],
    sourceKeys: (p) => [norm(p.title)],
    sourceList: async () => await getSource('/api/projects?perPage=200'),
    sourceLabel: (p) => p.title,
    sourceCover: (p) => p.coverImage || null,
    sourceGallery: async (p) => (p.images ?? [])
      .map(i => i?.src)
      .filter(src => src && src !== p.coverImage),
  },
}

async function traiter(nom, def) {
  const populate = [`populate[${def.coverField}][fields][0]=name`]
  if (GALERIES && def.galleryField) populate.push(`populate[${def.galleryField}][fields][0]=name`)

  const local = await getLocal(
    `/api/${def.localPath}?pagination[limit]=500&${def.localFields}&${populate.join('&')}`
  )
  const index = new Map()
  for (const entry of local.data ?? []) {
    for (const key of def.localKeys(entry)) if (key) index.set(key, entry)
  }

  const source = await def.sourceList()
  const stats = { couvertures: 0, galerie: 0, sautees: 0, placeholders: 0, absentes: 0, erreurs: 0 }

  for (const item of source) {
    const entry = def.sourceKeys(item).map(k => index.get(k)).find(Boolean)
    const label = String(def.sourceLabel(item) ?? '').slice(0, 55)

    if (!entry) { stats.absentes++; console.log(`  ? absent en local : ${label}`); continue }

    // ── Couverture ──
    const coverUrl = def.sourceCover(item)
    if (coverUrl) {
      const externe = estPlaceholder(coverUrl)
      if (entry[def.coverField] && !FORCE) {
        stats.sautees++
        console.log(`  = image déjà en place : ${label}`)
      } else if (externe && SANS_PLACEHOLDERS) {
        stats.placeholders++
        console.log(`  ~ placeholder ignoré : ${label}`)
      } else {
        const suffixe = externe ? ' [externe]' : ''
        try {
          if (DRY) {
            const ok = await avecReessai(() => checkUrl(coverUrl), label)
            if (ok) { stats.couvertures++; console.log(`  + couverture prête${suffixe} : ${label}`) }
            else { stats.erreurs++; console.log(`  ! couverture INJOIGNABLE (404)${suffixe} : ${label}`) }
          } else {
            const { id, ko } = await avecReessai(() => transferImage(coverUrl), label)
            await linkMedia(def.localPath, entry.documentId, def.coverField, id)
            stats.couvertures++
            console.log(`  + couverture (${ko} Ko)${suffixe} : ${label}`)
            await pause()
          }
        } catch (err) {
          stats.erreurs++
          console.log(`  ! échec couverture "${label}" : ${err.message}`)
        }
      }
    }

    // ── Galerie ──
    if (!GALERIES || !def.galleryField) continue
    const dejaRemplie = Array.isArray(entry[def.galleryField]) && entry[def.galleryField].length > 0
    if (dejaRemplie && !FORCE) continue

    const toutes = await def.sourceGallery(item)
    const urls = SANS_PLACEHOLDERS ? toutes.filter(u => !estPlaceholder(u)) : toutes
    stats.placeholders += toutes.length - urls.length
    if (!urls.length) continue

    if (DRY) {
      console.log(`  + galerie : ${urls.length} image(s) pour ${label}`)
      stats.galerie += urls.length
      continue
    }

    // Une image de galerie en échec ne doit pas faire perdre les autres :
    // on rattache celles qui ont abouti et on signale le reste.
    const ids = []
    for (const url of urls) {
      try {
        const { id } = await avecReessai(() => transferImage(url), label)
        ids.push(id)
        await pause()
      } catch (err) {
        stats.erreurs++
        console.log(`  ! image de galerie ignorée (${label}) : ${err.message}`)
      }
    }
    if (!ids.length) continue

    try {
      await linkMedia(def.localPath, entry.documentId, def.galleryField, ids)
      stats.galerie += ids.length
      console.log(`  + galerie : ${ids.length}/${urls.length} image(s) pour ${label}`)
    } catch (err) {
      stats.erreurs++
      console.log(`  ! échec rattachement galerie "${label}" : ${err.message}`)
    }
  }

  return stats
}

async function main() {
  console.log('=== Import des images depuis la production ===')
  console.log('Source      :', SOURCE_URL)
  console.log('Destination :', LOCAL_URL)
  console.log('Périmètre   :', GALERIES ? 'couvertures + galeries' : 'couvertures seulement')
  if (SANS_PLACEHOLDERS) console.log('Filtre      : --sans-placeholders, seules les images Cloudinary sont reprises')
  if (FORCE) console.log('Mode        : --force, les images existantes seront remplacées')
  if (DRY) console.log('Mode        : simulation (--dry), rien ne sera écrit')
  console.log('')

  // Le droit "upload" est distinct des droits sur les collections : autant le
  // vérifier avant de télécharger quoi que ce soit. Un POST sans corps renvoie
  // 400 si le droit est là, 401/403 sinon.
  if (!DRY) {
    const probe = await fetch(`${LOCAL_URL}/api/upload`, { method: 'POST', headers })
    if (probe.status === 401 || probe.status === 403) {
      throw new Error(
        `le jeton n'a pas le droit "upload" (HTTP ${probe.status}).\n` +
        '   Settings → API Tokens → éditer le jeton → section Upload → cocher "upload".'
      )
    }
  }

  const totaux = {}
  for (const [nom, def] of Object.entries(COLLECTIONS)) {
    if (!wanted(nom)) continue
    console.log(`${nom}…`)
    totaux[nom] = await traiter(nom, def)
    console.log('')
  }

  console.log('=== Terminé ===')
  let erreurs = 0
  for (const [nom, s] of Object.entries(totaux)) {
    erreurs += s.erreurs
    console.log(
      `  ${nom.padEnd(12)} couvertures: ${s.couvertures} | galerie: ${s.galerie} | ` +
      `déjà en place: ${s.sautees} | placeholders ignorés: ${s.placeholders} | ` +
      `absentes: ${s.absentes} | erreurs: ${s.erreurs}`
    )
  }
  if (!GALERIES) console.log('\nGaleries non traitées : relancez avec --galeries pour les inclure.')
  if (erreurs) process.exitCode = 1
}

main().catch((err) => {
  console.error('\n❌ Import interrompu :', err.message)
  process.exit(1)
})
