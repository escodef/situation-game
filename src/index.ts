import 'dotenv/config';
import { seedSituations } from './seeder/situations/situations.seeder';

type WebSocketData = {
    userId: string;
};

const websocketConfig: Bun.Serve.Options<WebSocketData>['websocket'] = {
    message(ws, message) {
        const textMessage = message.toString();
        console.log(`[WS] Сообщение от пользователя ${ws.data.userId}: ${textMessage}`);
        ws.publish('chat', `User ${ws.data.userId}: ${textMessage}`);
        ws.send(`[Server] Вы сказали: ${textMessage}`);
    },

    open(ws) {
        console.log(`[WS] Соединение открыто для ${ws.data.userId}`);
        ws.subscribe('chat');
        ws.send(`Добро пожаловать! Ваш ID: ${ws.data.userId}`);
    },

    close(ws, code, message) {
        console.log(`[WS] Соединение закрыто для ${ws.data.userId}. Код: ${code}`);
        ws.unsubscribe('chat');
    },

    perMessageDeflate: true,
};

const server = Bun.serve<WebSocketData>({
    port: 3000,

    async fetch(req, server) {
        const url = new URL(req.url);

        if (url.pathname === '/ws') {
            const success = server.upgrade(req, {
                data: { userId: crypto.randomUUID() },
            });

            if (success) {
                return undefined;
            }

            return new Response(
                'Ошибка апгрейда WebSocket. Убедитесь, что используете схему ws://',
                { status: 400 },
            );
        }

        if (url.pathname === '/') {
            return new Response('Привет от Bun HTTP Server! Для WebSocket используйте путь /ws', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        return new Response('Не найдено', { status: 404 });
    },

    websocket: websocketConfig,
});

async function bootstrap() {
    await seedSituations();

    console.log(`Bun Server запущен на http://${server.hostname}:${server.port}`);
}

bootstrap();
