module.exports = {
  async up(knex) {
    const hasColumn = await knex.schema.hasColumn('actualites', 'date_publication')

    if (!hasColumn) {
      await knex.schema.alterTable('actualites', (table) => {
        table.date('date_publication').nullable()
      })
    }
  },

  async down(knex) {
    const hasColumn = await knex.schema.hasColumn('actualites', 'date_publication')

    if (hasColumn) {
      await knex.schema.alterTable('actualites', (table) => {
        table.dropColumn('date_publication')
      })
    }
  },
}