'use strict';

// Donne une date_publication aux articles qui n'en ont pas encore (articles créés
// avant l'ajout du champ). Sans cela, le tri Strapi `date_publication:desc` place
// ces articles (valeur NULL) en tête de liste. Les nouveaux articles reçoivent la
// date automatiquement (lifecycles.js → beforeCreate).
module.exports = {
  async up(knex) {
    const hasTable = await knex.schema.hasTable('actualites');
    if (!hasTable) return;
    const hasColumn = await knex.schema.hasColumn('actualites', 'date_publication');
    if (!hasColumn) return;

    await knex('actualites')
      .whereNull('date_publication')
      .update({
        date_publication: knex.raw('CAST(COALESCE(published_at, created_at) AS DATE)'),
      });
  },

  async down() {
    // Rien à annuler : on ne sait plus quelles dates étaient vides.
  },
};
