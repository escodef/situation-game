import Elysia from 'elysia';
import { authenticate, CreateCardPackSchema, GetCardPacksSchema } from 'src/shared';
import { createCardPack, getAllCardPacks } from '../controllers/card-pack';

export const cardpack = new Elysia({
    prefix: '/card-pack',
    detail: { tags: ['Наборы карточек'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/', (ctx) => getAllCardPacks(ctx), {
        query: GetCardPacksSchema,
    })
    .post('/', (ctx) => createCardPack(ctx), {
        body: CreateCardPackSchema,
    });
