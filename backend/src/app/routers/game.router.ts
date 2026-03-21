import Elysia, { t } from 'elysia';
import { authenticate } from 'src/shared';
import { createGame, getGames, joinGame } from '../controllers/game';

export const game = new Elysia({ prefix: '/game' })
    .use(authenticate)
    .get('/:page/:take', ({ params: { page, take } }) => getGames(page, take), {
        params: t.Object({
            page: t.Number(),
            take: t.Number(),
        }),
    })
    .post('/join', ({ request, user }) => joinGame(request, user))
    .post('/create', ({ request, user }) => createGame(request, user));
