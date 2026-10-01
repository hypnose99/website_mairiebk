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
      // Pool de connexions.
      //
      // Le pooler Supabase ferme les connexions restees inactives. Sans duree de
      // vie ni recyclage, Knex garde ces connexions mortes dans son pool et finit
      // par echouer sur "Timeout acquiring a connection. The pool is probably full".
      //
      // idleTimeoutMillis rend la connexion avant que le pooler la coupe ;
      // reapIntervalMillis fait le menage regulierement ; les delais courts font
      // remonter une vraie erreur au lieu d'attendre une minute.
      pool: {
        min: 0,
        max: env.int('DATABASE_POOL_MAX', 5),
        idleTimeoutMillis:   20000,
        reapIntervalMillis:   5000,
        createTimeoutMillis: 15000,
        acquireTimeoutMillis: 20000,
        propagateCreateError: false,
      },
      acquireConnectionTimeout: 20000,
    },
  };
};
