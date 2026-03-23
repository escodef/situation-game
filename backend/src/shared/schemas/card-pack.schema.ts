import { type Static, t } from 'elysia';

export const CreateCardPackSchema = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 100,
        error: 'Название слишком короткое или длинное',
    }),
    cards: t.Files({
        minItems: 1,
        maxSize: '5m',
        type: ['image/jpeg', 'image/png', 'image/webp'],
        error: 'Нужно загрузить хотя бы одну карточку',
    }),
});

export const GetCardPacksSchema = t.Object({
    page: t.Number({ minimum: 1 }),
    take: t.Number({ maximum: 20 }),
});

export type CreateCardPackDto = Static<typeof CreateCardPackSchema>;
export type GetCardPacksDto = Static<typeof GetCardPacksSchema>;
