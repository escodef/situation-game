import { type Static, t } from 'elysia';

export const JoinGameSchema = t.Intersect([
    t.Union([t.Object({ code: t.String() }), t.Object({ gameId: t.String() })], {
        error: "Either 'code' or 'gameId' must be provided",
    }),
]);

export const CreateGameSchema = t.Object({
    maxPlayers: t.Integer({
        minimum: 2,
        error: 'Для игры нужно минимум 2 игрока',
    }),
    maxRounds: t.Integer({
        minimum: 1,
        error: 'В игре должен быть хотя бы 1 раунд',
    }),
    isOpen: t.Boolean({ default: false }),
    situationPacksIds: t.Array(t.String({ format: 'uuid' }), {
        minItems: 1,
        error: 'Нужно указать минимум один набор ситуаций',
    }),
    cardPacksIds: t.Array(t.String({ format: 'uuid' }), {
        minItems: 1,
        error: 'Нужно выбрать минимум один набор карточек',
    }),
});

export const GetGamesSchema = t.Object({
    page: t.Number({ minimum: 1 }),
    take: t.Number({ maximum: 20 }),
});

export const GetGameByIdSchema = t.Object({ id: t.String({ format: 'uuid' }) });

export type JoinGameDto = Static<typeof JoinGameSchema>;
export type CreateGameDto = Static<typeof CreateGameSchema>;
export type GetGamesDto = Static<typeof GetGamesSchema>;
export type GetGameByIdDto = Static<typeof GetGameByIdSchema>;
