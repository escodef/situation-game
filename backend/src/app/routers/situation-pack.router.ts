import Elysia from 'elysia';
import { authenticate, CreateSituationPackSchema, GetSituationPacksSchema } from 'shared';
import { getAllSituationPacks } from '../controllers/situation-pack';
import { createSituationPack } from '../controllers/situation-pack/create.controller';

export const situationpack = new Elysia({
    prefix: '/situation-pack',
    detail: { tags: ['Ситуации'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/', (ctx) => getAllSituationPacks(ctx), {
        query: GetSituationPacksSchema,
    })
    .post('/', (ctx) => createSituationPack(ctx), {
        body: CreateSituationPackSchema,
    });
