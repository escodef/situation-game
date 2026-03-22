import { Static, t } from 'elysia';

export const CreateSituationPackSchema = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 100,
        error: 'Название слишком короткое или длинное',
    }),
    situations: t.Array(t.String(), {
        minItems: 3,
        error: 'Нужно минимум 3 ситуации',
    }),
});

export type CreateSituationPackDto = Static<typeof CreateSituationPackSchema>;
