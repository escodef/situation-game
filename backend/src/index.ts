import { createApp } from './app/server';
import { seedSituations } from './database/seeders';

async function bootstrap() {
    await seedSituations();
    createApp();
}

bootstrap();
