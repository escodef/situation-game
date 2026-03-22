import Elysia from 'elysia';
import { authenticate, CreateSituationPackSchema } from 'src/shared';
import { createSituationPack } from '../controllers/situation-pack/create.controller';

export const situationpack = new Elysia({
    prefix: '/situation-pack',
    detail: { tags: ['Ситуации'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .post(
        '/create',
        ({ body, user, set }) =>
            createSituationPack({
                body,
                user,
                set,
            }),
        {
            body: CreateSituationPackSchema,
        },
    );
