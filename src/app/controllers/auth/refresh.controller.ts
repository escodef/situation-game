import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from 'src';
import { dayInMS } from 'src/constants';
import { usersTable } from 'src/database';
import { generateTokens, verifyRefreshToken } from 'src/utils/jwt';

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token not found',
            });
            return;
        }

        const decoded = verifyRefreshToken(refreshToken);

        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.userId))
            .limit(1);

        if (users.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }

        const user = users[0];

        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * dayInMS,
        });

        res.status(200).json({
            success: true,
            message: 'Tokens refreshed successfully',
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
