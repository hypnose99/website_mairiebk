// server/utils/secours.ts — Dernière réponse valide, pour survivre à une panne de Strapi
//
// Problème résolu : quand Strapi ne répond pas (mise en veille Render, incident
// réseau), les points d'API renvoyaient une liste vide. Cette liste vide était
// ensuite mise en cache pendant toute la durée du maxAge — le site restait vide
// plusieurs minutes alors que Strapi était déjà revenu.
//
// Principe : on garde en mémoire la dernière réponse réussie de chaque point
// d'API. En cas d'échec, on la ressert au lieu d'une liste vide. Le visiteur voit
// un contenu éventuellement un peu daté plutôt qu'une page vide.
//
// Si aucune réponse valide n'a encore été obtenue (premier démarrage pendant une
// panne), on laisse l'erreur remonter : Nitro ne met alors rien en cache, et la
// requête suivante retentera au lieu d'attendre l'expiration du cache.
//
// La mémoire est celle du processus : elle repart à zéro à chaque redéploiement.
// C'est voulu, et suffisant — il s'agit de passer un creux de quelques minutes.

// Au-delà de cette durée, une réponse gardée est jugée trop ancienne pour être
// resservie : mieux vaut une erreur franche qu'un contenu de la veille.
export const SECOURS_DUREE_MAX = 6 * 60 * 60 * 1000 // 6 heures

const memoire = new Map<string, { valeur: unknown, a: number }>()

// À appeler sur le chemin qui réussit : garde la réponse et la renvoie telle quelle.
export function memoriser<T>(cle: string, valeur: T): T {
  memoire.set(cle, { valeur, a: Date.now() })
  return valeur
}

// À appeler dans le catch : ressert la dernière réponse valide, ou laisse
// l'erreur remonter si l'on n'a rien de récent à proposer.
export function reprendre<T>(cle: string, motif: unknown): T {
  const garde = memoire.get(cle)

  if (garde && Date.now() - garde.a < SECOURS_DUREE_MAX) {
    const age = Math.round((Date.now() - garde.a) / 1000)
    console.warn(`[${cle}] Strapi indisponible (${String(motif)}) — reponse de secours servie (${age} s)`)
    return garde.valeur as T
  }

  console.error(`[${cle}] Strapi indisponible (${String(motif)}) — aucune reponse de secours`)
  throw createError({
    statusCode: 503,
    statusMessage: 'Service temporairement indisponible',
  })
}
