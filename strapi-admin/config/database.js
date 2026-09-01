module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host:     env('DATABASE_HOST',     'localhost'),
      port:     env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME',     'strapi'),
      user:     env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: { rejectUnauthorized: false },
      schema: 'public',
    },
    pool: { min: 2, max: 10 },
    acquireConnectionTimeout: 60000,
  },
});
