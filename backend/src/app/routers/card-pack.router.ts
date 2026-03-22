import Elysia from 'elysia';
import { authenticate, CreateCardPackSchema } from 'src/shared';
import { createCardPack } from '../controllers/card-pack';

export const cardpack = new Elysia({ prefix: '/card-pack', detail: { tags: ['Наборы карточек'] } })
    .use(authenticate)
    .post('/create', ({ body, user, set }) => createCardPack({ body, user, set }), {
        body: CreateCardPackSchema,
    });
