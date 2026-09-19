module.exports = ({ env }) => {
  // SSL : obligatoire vers Supabase, inutile et bloquant vers un PostgreSQL local.
  // Piloté par DATABASE_SSL (true/false) et DATABASE_SSL_REJECT_UNAUTHORIZED.
  const useSsl = env.bool('DATABASE_SSL', true);

  return {
    connection: {
      client: 'postgres',
      connection: {
        host:     env('DATABASE_HOST',     'localhost'),
        port:     env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME',     'strapi'),
        user:     env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: useSsl
          ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) }
          : false,
        schema: 'public',
      },
      pool: { min: 0, max: 10 },
      acquireConnectionTimeout: 60000,
    },
  };
};
