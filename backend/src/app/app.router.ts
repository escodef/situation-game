import { inspect } from 'bun';
import { authenticate } from 'src/shared/middlewares';
import { createGame, getGames } from './controllers/game';
import { getUser } from './controllers/user';
import { getMe } from './controllers/user/me.controller';

export const handleRoutes = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
        if (path.startsWith('/game')) {
            const { error, user } = await authenticate(req);

            if (error) return error;

            if (req.method === 'GET') {
                return await getGames(req);
            }

            if (req.method === 'POST') {
                return await createGame(req, user);
            }
        }

        if (path.startsWith('/user')) {
            const { error, user } = await authenticate(req);

            if (error) return error;

            if (req.method === 'GET') {
                if (path === '/user/me') {
                    return await getMe(req, user);
                }

                const match = path.match(/^\/user\/(\d+)$/);
                if (match) {
                    const userId = match[1];
                    return await getUser(req, userId);
                }
            }
        }

        return new Response('Not Found', { status: 404 });
    } catch (error) {
        console.error('handleRoutes() Error:', inspect(error));
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
