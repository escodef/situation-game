import { type Static, t } from 'elysia';

export const CreateSituationPackSchema = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 100,
        error: 'Название слишком короткое или длинное',
    }),
    situations: t.Array(
        t.Object({
            text: t.String(),
            isAdult: t.Boolean(),
            category: t.String(),
        }),
        {
            minItems: 3,
            error: 'Нужно минимум 3 ситуации',
        },
    ),
});

export const GetSituationPacksSchema = t.Object({
    page: t.Number({ minimum: 1, default: 1 }),
    take: t.Number({ maximum: 20, default: 10 }),
});

export type CreateSituationPackDto = Static<typeof CreateSituationPackSchema>;
export type GetSituationPacksDto = Static<typeof GetSituationPacksSchema>;
