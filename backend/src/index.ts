import { createApp } from './app/server';

// import { seedSituations } from './database/seeders';

async function bootstrap() {
    // await seedSituations();
    createApp(Number.parseInt(Bun.env.PORT || '3000', 10));
}

bootstrap();
