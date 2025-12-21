import { authenticate } from 'src/shared/middlewares';
import { loginUser, refreshToken, registerUser } from '../controllers/auth';
import { createGame, getGames } from '../controllers/game';
import { getProfile } from '../controllers/user';

export const handleRoutes = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    try {
        if (path.startsWith('/auth')) {
            if (path === '/auth/login' && method === 'POST') {
                return await loginUser(req);
            }
            if (path === '/auth/refresh' && method === 'POST') {
                return await refreshToken(req);
            }
            if (path === '/auth/register' && method === 'POST') {
                return await registerUser(req);
            }
            return new Response('Not Found', { status: 404 });
        }

        if (path.startsWith('/game')) {
            const { error, user } = await authenticate(req);

            if (error) return error;

            if (req.method === 'GET') {
                return await getGames(req);
            }

            if (req.method === 'POST') {
                return await createGame(req, user);
            }
            return new Response('Not Found', { status: 404 });
        }

        if (path.startsWith('/user')) {
            const { error, user } = await authenticate(req);

            if (error) return error;

            if (req.method === 'GET') {
                return await getProfile(req, user);
            }
            return new Response('Not Found', { status: 404 });
        }

        return new Response('Not Found', { status: 404 });
    } catch (error) {
        console.error('handleRoutes() Error:', error);
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
