// plugins/bootstrap.client.ts — Import du JS Bootstrap uniquement côté client
// Le suffixe .client.ts empêche l'exécution en SSR (pas de "window" côté serveur)
export default defineNuxtPlugin(async () => {
  const bootstrap = await import('bootstrap')
  return {
    provide: {
      bootstrap, // Disponible via useNuxtApp().$bootstrap si besoin
    },
  }
})
