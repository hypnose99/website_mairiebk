// src/admin/app.js — Personnalisation de l'administration Strapi
//
// 1. `locales` : langues proposées dans l'admin (Profil → Interface language).
//    Par défaut Strapi n'active que l'anglais ; le français doit être listé ici,
//    sinon il n'apparaît pas dans le menu déroulant.
// 2. `translations` : remplace certains textes de l'interface, par exemple
//    « Welcome to Strapi! » sur la page de connexion.
//
// Après modification : relancer `npm run develop` (ou `npm run build` puis
// `npm run start` en production) pour que l'admin soit reconstruit.

const config = {
  // Langues disponibles dans l'admin (l'anglais est toujours présent)
  locales: ['fr'],

  // Langue proposée par défaut aux nouveaux comptes
  tutorials: false,      // masque les vidéos de prise en main de Strapi
  notifications: { releases: false },  // masque les annonces de nouvelles versions

  translations: {
    fr: {
      'Auth.form.welcome.title': 'Mairie de Bouaké',
      'Auth.form.welcome.subtitle': 'Connectez-vous à l\'espace de gestion du site',
      'app.components.LeftMenu.navbrand.title': 'Mairie de Bouaké',
      'app.components.LeftMenu.navbrand.workplace': 'Espace de gestion',
      'HomePage.head.title': 'Accueil — Mairie de Bouaké',
    },
    en: {
      'Auth.form.welcome.title': 'Mairie de Bouaké',
      'Auth.form.welcome.subtitle': 'Sign in to the website management area',
      'app.components.LeftMenu.navbrand.title': 'Mairie de Bouaké',
      'app.components.LeftMenu.navbrand.workplace': 'Management area',
    },
  },
};

const bootstrap = () => {};

export default {
  config,
  bootstrap,
};
