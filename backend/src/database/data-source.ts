import { inspect } from 'bun';
import { Pool } from 'pg';
import { env } from 'shared';

const db = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
    console.error('error in db:', inspect(err));
    process.exit(-1);
});

export { db };
