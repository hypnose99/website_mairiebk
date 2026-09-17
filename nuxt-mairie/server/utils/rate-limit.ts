// server/utils/rate-limit.ts — Limitation simple des requêtes par adresse IP
//
// Protège les compteurs publics (vues, « j'aime ») contre les appels en boucle :
// sans cela, n'importe qui peut gonfler les chiffres avec un script.
// Stockage en mémoire du serveur Nuxt : suffisant pour une seule instance
// (Render « starter »). Avec plusieurs instances, passer à un stockage partagé
// (Redis / useStorage) — le principe reste le même.
import type { H3Event } from 'h3'

interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

/** Supprime de temps en temps les compteurs expirés pour ne pas saturer la mémoire. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/** Adresse du visiteur (derrière le proxy de l'hébergeur, on lit X-Forwarded-For). */
export function clientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || 'inconnue'
}

/**
 * Enregistre un passage pour `key` et indique s'il reste sous la limite
 * (`max` passages par fenêtre de `windowMs` millisecondes).
 */
export function hit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  sweep(now)
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  bucket.count++
  return bucket.count <= max
}

/** Lève une erreur 429 si la limite est dépassée. */
export function enforceRateLimit(event: H3Event, key: string, max: number, windowMs: number) {
  if (!hit(key, max, windowMs)) {
    setHeader(event, 'Retry-After', Math.ceil(windowMs / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Trop de requêtes, réessayez plus tard.' })
  }
}
