import Elysia, { t } from 'elysia';
import { authenticate } from 'shared';
import { getMe, getUser } from '../controllers/user';

export const user = new Elysia({
    prefix: '/user',
    detail: { tags: ['Пользователи'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/me', (ctx) => getMe(ctx))
    .get('/:id', ({ params: { id } }) => getUser(id), {
        params: t.Object({ id: t.String({ format: 'uuid' }) }),
    });
