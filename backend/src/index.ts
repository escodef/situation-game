import { createApp } from './app/server';
import { db } from './database/data-source';
import { seedSituations } from './database/seeders';

async function bootstrap() {
    await seedSituations(db);
    createApp()
}

bootstrap();
