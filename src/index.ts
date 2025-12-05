import 'dotenv/config';
import express from 'express';
import { seedSituations } from './seeder/situations/situations.seeder';

async function bootstrap() {
    await seedSituations();
    const app = express();

    app.listen(3000, () => {
        console.log('Server is running');
    });
}

bootstrap();
