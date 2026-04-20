import { inspect } from 'bun';
import { Pool } from 'pg';
import { getOrThrow } from 'shared';

const db = new Pool({
    user: getOrThrow(Bun.env.DB_USER),
    host: getOrThrow(Bun.env.DB_HOST),
    database: getOrThrow(Bun.env.DB_NAME),
    password: getOrThrow(Bun.env.DB_PASSWORD),
    port: 5432,
    max: 20,
    connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
    console.error('error in db:', inspect(err));
    process.exit(-1);
});

export { db };
