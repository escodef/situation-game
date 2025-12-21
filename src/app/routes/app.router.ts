import { authenticate } from 'src/shared/middlewares';
import { loginUser } from '../controllers/auth/login.controller';
import { refreshTokenController } from '../controllers/auth/refresh.controller';
import { registerUser } from '../controllers/auth/register.controller';
import { createGame } from '../controllers/game/create.controller';
import { getGame } from '../controllers/game/get.controller';

export const handleRoutes = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (path.startsWith('/auth')) {
        if (path === '/auth/login' && method === 'POST') {
            return await loginUser(req);
        }
        if (path === '/auth/refresh' && method === 'POST') {
            return await refreshTokenController(req);
        }
        if (path === '/auth/register' && method === 'POST') {
            return await registerUser(req);
        }
    }

    if (path.startsWith('/game')) {
        const { error, user } = await authenticate(req);

        if (error) return error;

        if (req.method === 'GET') {
            return await getGame(req);
        }

        if (req.method === 'POST') {
            return await createGame(req, user);
        }
    }

    return new Response('Not Found', { status: 404 });
};
