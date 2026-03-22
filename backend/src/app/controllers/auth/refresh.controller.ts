import { SessionRepo } from 'src/database/repositories';
import { dayInMS } from 'src/shared';
import { generateTokens, verifyRefreshToken } from 'src/shared/utils/jwt.util';

export const refreshToken = async ({ cookie: { refreshToken }, error }: any) => {
    const oldRefreshToken = refreshToken.value;

    if (!oldRefreshToken) {
        return error(401, { success: false, message: 'No token' });
    }

    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded || !decoded.userId) {
        return error(401, { success: false, message: 'Invalid token' });
    }

    const storedSession = await SessionRepo.findByOldRefresh(oldRefreshToken);

    if (!storedSession || !storedSession.user?.id || new Date() > storedSession.expiresAt) {
        return error(401, { success: false, message: 'Session not found or expired' });
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
