import { Elysia } from 'elysia';
import { verifyAccessToken } from 'src/shared/utils/jwt.util';
import { UnauthorizedError } from '../errors';

export const authenticate = new Elysia().derive({ as: 'global' }, ({ headers, set }) => {
    const authHeader = headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Отсутствует токен.');
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        set.status = 403;
        throw new Error('Forbidden - Invalid or expired token');
    }

    return {
        user: decoded,
    };
});
