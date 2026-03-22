import Elysia from 'elysia';
import { authenticate, CreateGameSchema, GetGamesSchema, JoinGameSchema } from 'src/shared';
import { createGame, getGames, joinGame } from '../controllers/game';

export const game = new Elysia({
    prefix: '/game',
    detail: { tags: ['Игры'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/:page/:take', ({ params: { page, take } }) => getGames(page, take), {
        params: GetGamesSchema,
    })
    .post('/join', ({ body, user, set }) => joinGame({ body, user, set }), {
        body: JoinGameSchema,
    })
    .post('/create', ({ body, user, set }) => createGame({ body, user, set }), {
        body: CreateGameSchema,
    });
