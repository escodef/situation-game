import { SessionRepo } from 'database';
import type { Context } from 'elysia';
import { type LogoutDto, UnauthorizedError } from 'shared';

export const logoutUser = async ({
    headers,
    cookie: { refreshToken },
}: Pick<Context, 'cookie'> & { headers: LogoutDto }) => {
    const authHeader = headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return new UnauthorizedError('Токен не валиден');
    }

    await SessionRepo.deleteByAccess(token);

    refreshToken?.remove();

    return { success: true };
};
