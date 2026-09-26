import { init } from '@sentry/bun';
import { initWebsocketManager } from 'app/socket';
import { runMigrations, seedAdmin, seedSituations } from 'database';
import { env } from 'shared';
import { createApp } from './app/server';

init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
});

async function bootstrap() {
    await runMigrations();
    await seedSituations();
    await seedAdmin();

    const app = createApp(env.PORT);

    console.log(`Сервер запущен на порту ${app.server?.port}`);
    console.log(
        `Сваггер доступен по пути ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}${env.OPENAPI_PATH}`,
    );

    if (app.server) {
        initWebsocketManager(app.server);
    }
}

bootstrap();
