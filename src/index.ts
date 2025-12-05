import 'dotenv/config';
import { db } from './database/data-source';
import { seedSituations } from './database/seeders';

async function bootstrap() {
    await seedSituations(db);
}

bootstrap();
