import { SessionRepo } from 'database';
import type { Cookie } from 'elysia';
import { AUTH_CONFIG, generateTokens, UnauthorizedError, verifyRefreshToken } from 'shared';

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
    if (!decoded?.userId) {
        throw new UnauthorizedError('Невалидный токен');
    }

    let tokens = generateTokens({
        userId: decoded.userId,
    });

    const rotatedSession = await SessionRepo.rotateSession(
        oldRefreshToken,
        tokens.accessToken,
        tokens.refreshToken,
    );

    if (!rotatedSession) {
        const activeSession = await SessionRepo.findLatestByUserId(decoded.userId);
        if (!activeSession) {
            throw new UnauthorizedError('Сессия не найдена или токен протух');
        }

        tokens = {
            accessToken: activeSession.accessToken,
            refreshToken: activeSession.refreshToken,
        };
    }

    refreshToken.set({
        value: tokens.refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: AUTH_CONFIG.refreshExpires,
        path: '/',
    });

    return {
        success: true,
        accessToken: tokens.accessToken,
    };
};
