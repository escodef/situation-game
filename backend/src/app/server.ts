import staticPlugin from '@elysiajs/static';
import { Elysia, NotFoundError } from 'elysia';
import {
    BadRequestError,
    ConflictError,
    SocketBodySchema,
    SocketQuerySchema,
    UnauthorizedError,
    verifyAccessToken,
} from 'shared';
import { openApi, sessionCleanup } from './plugins';
import { auth, cardpack, game, situationpack, user } from './routers';
import { handleMessage } from './socket/websocket.handler';
import { WebsocketManager } from './socket/websocket.manager';

export const createApp = (port: number) => {
    const wsManager = WebsocketManager.getInstance();

    const app = new Elysia()
        .error({
            UNAUTHORIZED: UnauthorizedError,
            NOT_FOUND: NotFoundError,
            BAD_REQUEST: BadRequestError,
            CONFLICT: ConflictError,
        })
        .onError(({ code, error, set }) => {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Error ${code}]:`, message);

            switch (code) {
                case 'BAD_REQUEST':
                    set.status = 400;
                    return { success: false, message: error.message };
                case 'UNAUTHORIZED':
                    set.status = 401;
                    return { success: false, message: error.message };
                case 'NOT_FOUND':
                    set.status = 404;
                    return { success: false, message: error.message };
                case 'CONFLICT':
                    set.status = 409;
                    return { success: false, message: error.message };
                case 'VALIDATION':
                    set.status = 422;
                    return { success: false, message: 'Ошибка валидации', details: error.all };
                case 'INTERNAL_SERVER_ERROR':
                    set.status = 500;
                    return { success: false, message: 'Внутренняя ошибка сервера' };
                default:
                    set.status = 500;
                    return { success: false, message: 'Неизвестная ошибка' };
            }
        })
        .use(staticPlugin({ assets: 'docs', prefix: '' }))
        .get('/asyncapi', () => Bun.file('./docs/index.html'), { detail: { hide: true } })
        .use(sessionCleanup)
        .use(openApi)
        .group('/api', (app) => app.use(auth).use(user).use(game).use(situationpack).use(cardpack))
        .group('', (group) =>
            group
                .derive(({ query }) => {
                    const token = query.token;
                    if (!token) throw new UnauthorizedError('Token required');

                    const payload = verifyAccessToken(token);
                    if (!payload) throw new UnauthorizedError('Invalid or expired token');

                    return {
                        userId: payload.userId,
                    };
                })
                .ws('/ws', {
                    query: SocketQuerySchema,
                    body: SocketBodySchema,

                    open(ws) {
                        console.log('User connected:', ws.data.userId);
                        wsManager.handleConnect(ws);
                    },
                    message(ws, message) {
                        handleMessage(ws, message);
                    },
                    close(ws) {
                        wsManager.handleDisconnect(ws.data.userId);
                    },
                }),
        )
        .listen({
            port,
            maxRequestBodySize: 1024 * 1024 * 100,
        });

    console.log(`Server is running on port ${app.server?.port}`);
    return app;
};
