import Elysia, { t } from 'elysia';
import { authenticate } from 'src/shared';
import { getMe, getUser } from '../controllers/user';

export const user = new Elysia({ prefix: '/user' })
    .use(authenticate)
    .get('/me', ({ user }) => getMe(user))
    .get('/:id', ({ params: { userId } }) => getUser(userId), {
        params: t.Object({ userId: t.String({ format: 'uuid' }) }),
    });
