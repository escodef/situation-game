import Elysia, { t } from 'elysia';
import { authenticate } from 'src/shared';
import { getMe, getUser } from '../controllers/user';

export const user = new Elysia({
    prefix: '/user',
    detail: { tags: ['Пользователи'], security: [{ bearerAuth: [] }] },
})
    .use(authenticate)
    .get('/me', (ctx) => getMe(ctx))
    .get('/:id', ({ params: { userId } }) => getUser(userId), {
        params: t.Object({ userId: t.String({ format: 'uuid' }) }),
    });
