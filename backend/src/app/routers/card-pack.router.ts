import Elysia, { t } from 'elysia';
import { authenticate } from 'src/shared';
import { createCardPack } from '../controllers/card-pack/create.controller';

export const cardpack = new Elysia({ prefix: '/card-pack' })
    .use(authenticate)
    .post('/create', ({ body, user, set }) => createCardPack({ body, user, set }), {
        body: t.Object({
            name: t.String({
                minLength: 3,
                maxLength: 100,
                error: 'Название слишком короткое или длинное',
            }),
            cards: t.Files({
                minItems: 1,
                maxSize: '5m',
                type: ['image/jpeg', 'image/png', 'image/webp'],
                error: 'Нужно загрузить хотя бы одну карточку (JPEG, PNG, WebP до 5MB)',
            }),
        }),
    });
