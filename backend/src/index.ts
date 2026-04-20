import { initWebsocketManager } from 'app/socket';
import { seedAdmin, seedSituations } from 'database';
import { getOrThrow } from 'shared';
import { createApp } from './app/server';

async function bootstrap() {
    await seedSituations();
    await seedAdmin();

    const app = createApp(Number.parseInt(getOrThrow(Bun.env.PORT) || '3000', 10));

    console.log(`Сервер запущен на порту ${app.server?.port}`);
    console.log(
        `Сваггер доступен по пути ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}${getOrThrow(Bun.env.OPENAPI_PATH)}`,
    );

    if (app.server) {
        initWebsocketManager(app.server);
    }
}

bootstrap();
