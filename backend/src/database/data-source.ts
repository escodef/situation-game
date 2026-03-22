import { inspect } from 'bun';
import { Pool } from 'pg';

const db = new Pool({
    user: Bun.env.DB_USER,
    host: Bun.env.DB_HOST,
    database: Bun.env.DB_NAME,
    password: Bun.env.DB_PASSWORD,
    port: 5432,
    max: 20,
    connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
    console.error('error in db:', inspect(err));
    process.exit(-1);
});

export { db };
