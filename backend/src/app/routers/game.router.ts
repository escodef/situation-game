import Elysia from 'elysia';
import {
    authenticate,
    CreateGameSchema,
    GetGameByIdSchema,
    GetGamesSchema,
    JoinGameSchema,
} from 'shared';
import { createGame, getGameById, getGames, joinGame } from '../controllers/game';

export const game = new Elysia({
    prefix: '/game',
    detail: { tags: ['Игры'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/', (ctx) => getGames(ctx), {
        query: GetGamesSchema,
    })
    .get('/:id', (ctx) => getGameById(ctx), {
        params: GetGameByIdSchema,
    })
    .post('/join', (ctx) => joinGame(ctx), {
        body: JoinGameSchema,
    })
    .post('/', (ctx) => createGame(ctx), {
        body: CreateGameSchema,
    });
