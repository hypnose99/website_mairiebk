// plugins/google-tag.client.ts — Balise Google (gtag.js / Google Analytics 4)
//
// L'identifiant vient de la variable d'environnement GOOGLE_TAG_ID
// (ex. G-XXXXXXXXXX ou GT-XXXXXXX). Sans elle, rien n'est chargé : aucune
// mesure en développement, et le site fonctionne normalement.
//
// Le suivi des pages est envoyé à chaque changement de page, car le site est
// une application Nuxt : sans cela, Google ne compterait que la première page.
export default defineNuxtPlugin(() => {
  const { googleTagId } = useRuntimeConfig().public
  if (!googleTagId) return

  const router = useRouter()

  // File d'attente gtag (le script officiel la consomme au chargement)
  const w = window as any
  w.dataLayer = w.dataLayer || []
  function gtag(...args: any[]) { w.dataLayer.push(args) }
  w.gtag = gtag

  gtag('js', new Date())
  // send_page_view: false → on envoie nous-mêmes la page à chaque navigation
  gtag('config', googleTagId, { send_page_view: false, anonymize_ip: true })

  useHead({
    script: [{
      src: `https://www.googletagmanager.com/gtag/js?id=${googleTagId}`,
      async: true,
    }],
  })

  const sendPageView = (path: string) => {
    gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  }

  // Première page
  sendPageView(router.currentRoute.value.fullPath)
  // Pages suivantes (navigation sans rechargement)
  router.afterEach((to) => {
    // Le titre est mis à jour après le rendu : on attend un instant
    setTimeout(() => sendPageView(to.fullPath), 80)
  })
})
