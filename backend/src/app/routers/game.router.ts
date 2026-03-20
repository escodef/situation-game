import Elysia from 'elysia';
import { authenticate } from 'src/shared';
import z from 'zod';
import { createGame, getGames } from '../controllers/game';

export const auth = new Elysia({ prefix: '/game' })
    .use(authenticate)
    .get('/:page/:take', ({ params: { page, take } }) => getGames(page, take), {
        params: z.object({
            page: z.coerce.number(),
            take: z.coerce.number(),
        }),
    })
    .post('/create', ({ request }) => createGame(request));
