import { inspect } from 'bun';
import { Pool } from 'pg';
import { getOrThrow } from 'shared';

const db = new Pool({
    connectionString: getOrThrow(Bun.env.DATABASE_URL),
    max: 20,
    connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
    console.error('error in db:', inspect(err));
    process.exit(-1);
});

export { db };
