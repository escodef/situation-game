import { Static, t } from 'elysia';

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

export type CreateCardPackDto = Static<typeof CreateCardPackSchema>;
