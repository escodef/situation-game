import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/database/schemas/index.ts',
    dialect: 'postgresql',
    dbCredentials: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: 5432,
        ssl: false,
    },
    verbose: true,
    strict: true,
});
