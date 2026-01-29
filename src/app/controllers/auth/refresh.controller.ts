import { and, eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { refreshTokensTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens, verifyRefreshToken } from 'src/shared/utils/jwt.util';

export const refreshTokenController = async (req: Request): Promise<Response> => {
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

        const storedSession = await db.query.refreshTokensTable.findFirst({
            where: and(
                eq(refreshTokensTable.token, oldRefreshToken),
                eq(refreshTokensTable.userId, decoded.userId),
            ),
            with: {
                user: {
                    with: {
                        roles: { with: { role: true } },
                    },
                },
            },
        });

        if (!storedSession || new Date() > storedSession.expiresAt) {
            return Response.json({ success: false, message: 'Session not found' }, { status: 401 });
        }

        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, storedSession.id));

        const roleNames = storedSession.user.roles.map((r) => r.role.name);
        const tokens = generateTokens({
            userId: storedSession.user.id,
            roles: roleNames,
        });

        await db.insert(refreshTokensTable).values({
            userId: storedSession.user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * dayInMS),
        });

        const isProd = process.env.NODE_ENV === 'production';
        const headers = new Headers();
        headers.append(
            'Set-Cookie',
            `refreshToken=${tokens.refreshToken}; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Max-Age=${(7 * dayInMS) / 1000}; Path=/`,
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
