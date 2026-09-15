module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      // Désactivé temporairement (Windows) : la génération de plusieurs formats
      // en parallèle multiplie les fichiers temporaires, ce qui augmente le
      // risque de collision avec l'antivirus lors du nettoyage du dossier temp
      // (erreur ENOTEMPTY: directory not empty, rmdir 'strapi-upload-...').
      sizeOptimization: false,
      responsiveDimensions: false,
    },
  },
});
