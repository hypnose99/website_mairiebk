module.exports = {
  async up(knex) {
    // Base neuve : les tables n'existent pas encore quand Strapi joue les
    // migrations. La colonne sera creee automatiquement depuis schema.json.
    const hasTable = await knex.schema.hasTable('actualites')
    if (!hasTable) return

    const hasColumn = await knex.schema.hasColumn('actualites', 'date_publication')

    if (!hasColumn) {
      await knex.schema.alterTable('actualites', (table) => {
        table.date('date_publication').nullable()
      })
    }
  },

  async down(knex) {
    const hasTable = await knex.schema.hasTable('actualites')
    if (!hasTable) return

    const hasColumn = await knex.schema.hasColumn('actualites', 'date_publication')

    if (hasColumn) {
      await knex.schema.alterTable('actualites', (table) => {
        table.dropColumn('date_publication')
      })
    }
  },
}