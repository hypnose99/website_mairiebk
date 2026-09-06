module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src':  ["'self'", 'https:'],
          'img-src':      ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com', 'images.unsplash.com'],
          'media-src':    ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // CORS_ORIGINS : liste d'origines supplémentaires séparées par des virgules
      // (ex. "https://mairie-bouake.ci,https://mairie-bouake-site.onrender.com"),
      // à définir une fois l'URL de production connue — sans avoir besoin de
      // modifier ce fichier ni de redéployer.
      origin: [
        'http://localhost:3000',
        'http://localhost:1337',
        ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : []),
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
];
