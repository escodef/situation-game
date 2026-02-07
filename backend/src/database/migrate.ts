import fs from 'node:fs';
import path from 'node:path';
import { db } from './data-source';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, './migrations');

async function runMigrations() {
    const client = await db.connect();

    await client.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.error(`Папка не найдена: ${MIGRATIONS_DIR}`);
        client.release();
        return;
    }

    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR).sort();

    for (const file of migrationFiles) {
        const check = await client.query('SELECT id FROM _migrations WHERE name = $1', [file]);

        if (check.rowCount === 0) {
            console.log(`Executing: ${file}`);
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                console.error(`Error in ${file}:`, e);
                break;
            }
        }
    }
    client.release();
}

runMigrations();
