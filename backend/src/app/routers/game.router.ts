import Elysia from 'elysia';
import { authenticate, CreateGameSchema, GetGamesSchema, JoinGameSchema } from 'shared';
import { createGame, getGames, joinGame } from '../controllers/game';

export const game = new Elysia({
    prefix: '/game',
    detail: { tags: ['Игры'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/', (ctx) => getGames(ctx), {
        query: GetGamesSchema,
    })
    .post('/join', (ctx) => joinGame(ctx), {
        body: JoinGameSchema,
    })
    .post('/', (ctx) => createGame(ctx), {
        body: CreateGameSchema,
    });
