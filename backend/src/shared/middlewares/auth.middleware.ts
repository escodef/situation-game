import { SessionRepo } from 'database';
import { Elysia } from 'elysia';
import { verifyAccessToken } from 'shared/utils';
import { UnauthorizedError } from '../errors';

export const authenticate = new Elysia().derive({ as: 'global' }, async ({ headers, set }) => {
    const authHeader = headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Отсутствует токен');
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        set.status = 403;
        throw new UnauthorizedError('Невалидный токен или токен истёк');
    }

    const session = await SessionRepo.findByAccess(token);

    if (!session || session.expiresAt < new Date()) {
        set.status = 403;
        throw new UnauthorizedError('Сессия истекла или пользователь вышел');
    }

    return {
        user: decoded,
    };
});
