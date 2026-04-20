import { type Static, t } from 'elysia';

export const CreateCardPackSchema = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 50,
        error: 'Название слишком короткое или длинное',
    }),
    cards: t.Files({
        minItems: 1,
        maxItems: 50,
        maxSize: '2m',
        type: ['image/jpeg', 'image/png', 'image/webp'],
        error: 'Нужно загрузить хотя бы одну карточку',
    }),
});

export const GetCardPacksSchema = t.Object({
    page: t.Number({ minimum: 1, default: 1 }),
    take: t.Number({ maximum: 20, default: 10 }),
});

export type CreateCardPackDto = Static<typeof CreateCardPackSchema>;
export type GetCardPacksDto = Static<typeof GetCardPacksSchema>;
