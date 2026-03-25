import type { Cookie } from 'elysia';
import { SessionRepo } from 'src/database/repositories';
import { dayInMS, generateTokens, UnauthorizedError, verifyRefreshToken } from 'src/shared';

export const refreshToken = async ({
    cookie,
}: {
    cookie: Record<string, Cookie<unknown>> & {
        refreshToken: Cookie<string>;
    };
}) => {
    const { refreshToken } = cookie;

    if (!refreshToken?.value) {
        throw new UnauthorizedError('Не передан токен для обновления');
    }
    const oldRefreshToken = refreshToken.value;

    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded || !decoded.userId) {
        throw new UnauthorizedError('Невалидный токен');
    }

    const storedSession = await SessionRepo.findByOldRefresh(oldRefreshToken);

    if (!storedSession || !storedSession.user?.id || new Date() > storedSession.expiresAt) {
        throw new UnauthorizedError('Сессия не найдена или токен протух');
    }

    await SessionRepo.deleteByRefresh(oldRefreshToken);

    const tokens = generateTokens({
        userId: storedSession.user.id,
    });

    await SessionRepo.create({
        userId: storedSession.user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    });

    refreshToken.set({
        value: tokens.refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: (7 * dayInMS) / 1000,
        path: '/',
    });

    return {
        success: true,
        accessToken: tokens.accessToken,
    };
};
