import { initWebsocketManager } from 'app/socket';
import { seedSituations } from 'database';
import { createApp } from './app/server';

async function bootstrap() {
    await seedSituations();

    const app = createApp(Number.parseInt(Bun.env.PORT || '3000', 10));

    console.log(`Сервер запущен на порту ${app.server?.port}`);
    console.log(
        `Сваггер доступен по пути ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}${Bun.env.OPENAPI_PATH ?? '/openapi'}`,
    );

    if (app.server) {
        initWebsocketManager(app.server);
    }
}

bootstrap();
