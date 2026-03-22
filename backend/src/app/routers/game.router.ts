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
    .post('/join', ({ body, user, set }) => joinGame({ body, user, set }), {
        body: t.Intersect([
            t.Object({
                code: t.Optional(
                    t.String({ minLength: 6, maxLength: 6, pattern: '^[A-Za-z0-9]+$' }),
                ),
                gameId: t.Optional(t.String({ format: 'uuid' })),
            }),
            t.Union([t.Object({ code: t.String() }), t.Object({ gameId: t.String() })], {
                error: "Either 'code' or 'gameId' must be provided",
            }),
        ]),
    })
    .post('/create', ({ body, user, set }) => createGame({ body, user, set }), {
        body: t.Object({
            maxPlayers: t.Integer({
                minimum: 2,
                error: 'Для игры нужно минимум 2 игрока',
            }),
            maxRounds: t.Integer({
                minimum: 1,
                error: 'В игре должен быть хотя бы 1 раунд',
            }),
            isOpen: t.Optional(t.Boolean({ default: false })),
            situationPacksIds: t.Array(t.String({ format: 'uuid' }), {
                minItems: 1,
                error: 'Нужно указать минимум один набор ситуаций',
            }),
            cardPacksIds: t.Array(t.String({ format: 'uuid' }), {
                minItems: 1,
                error: 'Нужно выбрать минимум один набор карточек',
            }),
        }),
    });
