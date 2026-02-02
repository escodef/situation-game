import Bun from 'bun';
import { verifyAccessToken } from 'src/shared/utils/jwt.util';
import { handleRoutes } from './routes';
import { ISocketData } from './socket/types';
import { handleMessage } from './socket/websocket.handler';
import { WebsocketManager } from './socket/websocket.manager';

export const createApp = () => {
    const wsManager = WebsocketManager.getInstance();
    const PORT = 3000;

    const server = Bun.serve<ISocketData>({
        port: PORT,

        async fetch(req, server) {
            const url = new URL(req.url);

            if (url.pathname === '/ws') {
                const token = url.searchParams.get('token');

                if (!token) {
                    return new Response('Token required', { status: 401 });
                }

                const payload = verifyAccessToken(token);

                if (!payload) {
                    return new Response('Invalid or expired token', {
                        status: 403,
                    });
                }

                const success = server.upgrade(req, {
                    data: {
                        userId: payload.userId,
                        token: token,
                    },
                });

                if (success) return undefined;
                return new Response('WebSocket upgrade failed', {
                    status: 500,
                });
            }

            return await handleRoutes(req);
        },

        websocket: {
            open(ws) {
                wsManager.handleConnect(ws);
            },
            message(ws, message) {
                handleMessage(ws, message);
            },
            close(ws) {
                wsManager.handleDisconnect(ws.data.userId);
            },
        },
    });

    console.log(`Server is running on port ${server.port}`);
};
