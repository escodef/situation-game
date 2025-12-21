import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { userTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens, verifyRefreshToken } from 'src/shared/utils/jwt';

export const refreshToken = async (req: Request): Promise<Response> => {
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => c.split('='))
        );
        
        const refreshToken = cookies['refreshToken'];

        if (!refreshToken) {
            return Response.json({
                success: false,
                message: 'Refresh token not found',
            }, { status: 401 });
        }

        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded || !decoded.userId) {
            return Response.json({
                success: false,
                message: 'Invalid or expired refresh token',
            }, { status: 401 });
        }

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, decoded.userId))
            .limit(1);

        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 401 });
        }

        const user = users[0];
        const tokens = generateTokens({ userId: user.id });

        const headers = new Headers();
        const isProd = process.env.NODE_ENV === 'production';
        
        headers.append('Set-Cookie', 
            `refreshToken=${tokens.refreshToken}; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Max-Age=${(7 * dayInMS) / 1000}; Path=/`
        );

        return Response.json({
            success: true,
            message: 'Tokens refreshed successfully',
            accessToken: tokens.accessToken,
        }, { 
            status: 200, 
            headers 
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        return Response.json({
            success: false,
            message: 'Internal server error',
        }, { status: 500 });
    }
};