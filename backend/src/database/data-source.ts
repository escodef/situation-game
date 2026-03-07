import { inspect } from 'bun';
import { Pool } from 'pg';

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 20,
    connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
    console.error('error in db:', inspect(err));
    process.exit(-1);
});

export { db };
