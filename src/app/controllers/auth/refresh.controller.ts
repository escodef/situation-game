import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from 'src/database/data-source';
import { playersTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens, verifyRefreshToken } from 'src/shared/utils/jwt';

export const refreshToken = async (
    req: Request,
    res: Response
): Promise<void> => {
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

        const players = await db
            .select()
            .from(playersTable)
            .where(eq(playersTable.id, decoded.userId))
            .limit(1);

        if (players.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }

        const player = players[0];

        const tokens = generateTokens({
            userId: player.id,
            email: player.email,
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
