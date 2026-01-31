import { RefreshTokenRepo } from 'src/database/repositories/refresh-token.repo';
import { dayInMS } from 'src/shared';
import { generateTokens, verifyRefreshToken } from 'src/shared/utils/jwt.util';

export const refreshToken = async (req: Request): Promise<Response> => {
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')));
        const oldRefreshToken = cookies['refreshToken'];

        if (!oldRefreshToken) {
            return Response.json({ success: false, message: 'No token' }, { status: 401 });
        }

        const decoded = verifyRefreshToken(oldRefreshToken);
        if (!decoded || !decoded.userId) {
            return Response.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const storedSession = await RefreshTokenRepo.findByOldRefresh(oldRefreshToken);

        if (!storedSession || new Date() > storedSession.expiresAt) {
            return Response.json(
                { success: false, message: 'Session not found or expired' },
                { status: 401 },
            );
        }

        await RefreshTokenRepo.deleteByRefresh(oldRefreshToken);

        const tokens = generateTokens({
            userId: storedSession.user.id,
            roles: storedSession.user.roles,
        });

        await RefreshTokenRepo.create({
            userId: storedSession.user.id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

        const headers = new Headers();
        headers.append(
            'Set-Cookie',
            `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${(7 * dayInMS) / 1000}; Path=/`,
        );

        return Response.json(
            {
                success: true,
                accessToken: tokens.accessToken,
            },
            { status: 200, headers },
        );
    } catch (error) {
        console.error('Refresh Error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
