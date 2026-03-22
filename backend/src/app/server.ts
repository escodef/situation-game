import openapi, { fromTypes } from '@elysiajs/openapi';
import { Elysia, t } from 'elysia';
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
            query: t.Object({
                userId: t.String(),
                token: t.String(),
            }),
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
                wsManager.handleConnect(ws);
            },
            message(ws, message) {
                handleMessage(ws, message);
            },
            close(ws) {
                wsManager.handleDisconnect(ws.data.query.userId);
            },
        })
        .listen({
            port,
            maxRequestBodySize: 1024 * 1024 * 100,
        });

    console.log(`Server is running on port ${app.server?.port}`);
    return app;
};
