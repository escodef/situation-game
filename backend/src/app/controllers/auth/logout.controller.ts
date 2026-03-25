import { SessionRepo } from 'src/database/repositories';
import { UnauthorizedError } from 'src/shared';

export const logoutUser = async ({ headers, cookie: { refreshToken } }: any) => {
    const authHeader = headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return new UnauthorizedError('Токен не валиден');
    }

    await SessionRepo.deleteByAccess(token);

    refreshToken.remove();

    return { success: true };
};
