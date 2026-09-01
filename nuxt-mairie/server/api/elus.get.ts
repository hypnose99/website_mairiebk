// server/api/elus.get.ts — Route API Nitro : données des élus
import elusData from '~/data/elus.json'

export default defineEventHandler(() => {
  // En production, ce handler pourrait interroger une base de données
  return elusData
})
