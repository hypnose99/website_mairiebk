// test-api.js — Diagnostic de l'API Strapi
// Usage : node test-api.js

try { process.loadEnvFile() } catch { /* .env optionnel */ }

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')
const TOKEN      = process.env.STRAPI_TOKEN || process.env.STRAPI_API_TOKEN || ''

if (!TOKEN) {
  console.error('Jeton Strapi manquant : definis STRAPI_TOKEN dans strapi-admin/.env')
  process.exit(1)
}

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
