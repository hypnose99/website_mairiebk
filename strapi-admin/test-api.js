// test-api.js — Diagnostic de l'API Strapi
// Usage : node test-api.js

const STRAPI_URL = 'http://localhost:1337'
const TOKEN      = 'd691a634b54b6e4239b4bfa54647a918e9a683d4f81d203359af414452c26d1e0d6fdf634d89f4a50d2602661f1253d20db7fcc1dfdcb458dba192cffd10f0448494a8d0adb92f9dcab61336e285cdf9b148ae93a3b58703d613441035debb8faefff0d9cf62b9b9499cf64caafd1c8457b49ba0cc03f4810b56214fc11b769c'

async function test(label, url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      ...options,
    })
    const text = await res.text()
    let body
    try { body = JSON.parse(text) } catch { body = text }
    console.log(`\n[${res.status}] ${label}`)
    if (res.status >= 400) {
      console.log('  →', typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200))
    } else {
      const count = body?.data?.length ?? body?.data?.id ?? '✅ ok'
      console.log('  → OK:', count)
    }
  } catch (e) {
    console.log(`\n[ERR] ${label}: ${e.message}`)
  }
}

async function main() {
  console.log('=== Diagnostic API Strapi ===\n')
  console.log('URL :', STRAPI_URL)
  console.log('Token :', TOKEN.slice(0, 20) + '...')

  // 1. Sanity check : est-ce que Strapi répond ?
  await test('GET /', `${STRAPI_URL}/`)

  // 2. Endpoints connus
  await test('GET /api/actualites', `${STRAPI_URL}/api/actualites?pagination[pageSize]=1`)
  await test('GET /api/flash-infos', `${STRAPI_URL}/api/flash-infos?pagination[pageSize]=1`)
  await test('GET /api/evenements',  `${STRAPI_URL}/api/evenements?pagination[pageSize]=1`)
  await test('GET /api/projets',     `${STRAPI_URL}/api/projets?pagination[pageSize]=1`)

  // 3. POST minimal sur projets
  await test('POST /api/projets (minimal)', `${STRAPI_URL}/api/projets`, {
    method: 'POST',
    body: JSON.stringify({ data: { titre: 'Test diagnostic' } }),
  })

  console.log('\n=== Fin du diagnostic ===\n')
}

main().catch(console.error)
