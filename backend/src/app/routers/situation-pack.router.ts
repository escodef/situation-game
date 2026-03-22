import Elysia, { t } from 'elysia';
import { authenticate } from 'src/shared';
import { createSituationPack } from '../controllers/situation-pack/create.controller';

export const situationpack = new Elysia({ prefix: '/situation-pack' }).use(authenticate).post(
    '/create',
    ({ body, user, set }) =>
        createSituationPack({
            body,
            user,
            set,
        }),
    {
        body: t.Object({
            name: t.String({
                minLength: 3,
                maxLength: 100,
                error: 'Название слишком короткое или длинное',
            }),
            situations: t.Array(t.String(), {
                minItems: 3,
                error: 'Нужно минимум 3 ситуации',
            }),
        }),
    },
);
