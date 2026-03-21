import openapi, { fromTypes } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { verifyAccessToken } from 'src/shared';
import { auth, cardpack, game, situationpack, user } from './routers';
import { handleMessage } from './socket/websocket.handler';
import { WebsocketManager } from './socket/websocket.manager';

export const createApp = (port: number) => {
    const wsManager = WebsocketManager.getInstance();

    const app = new Elysia()
        .use(
            openapi({
                references: fromTypes(),
            }),
        )
        .use(auth)
        .use(user)
        .use(game)
        .use(situationpack)
        .use(cardpack)

        .ws('/ws', {
            beforeHandle({ query, set }) {
                const token = query.token;

                if (!token) {
                    set.status = 401;
                    return 'Token required';
                }

                const payload = verifyAccessToken(token);
                if (!payload) {
                    set.status = 403;
                    return 'Invalid or expired token';
                }

                return {
                    userId: payload.userId,
                };
            },

            open(ws) {
                wsManager.handleConnect(ws.raw);
            },
            message(ws, message) {
                handleMessage(ws.raw, message);
            },
            close(ws) {
                wsManager.handleDisconnect(ws.data.userId);
            },
        })
        .listen({
            port,
            maxRequestBodySize: 1024 * 1024 * 100,
        });

    console.log(`Server is running on port ${app.server?.port}`);
    return app;
};
