import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from 'src/database/data-source';
import { playersTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens } from 'src/shared/utils/jwt';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parseResult.error).errors,
        });
        return;
    }

    try {
        const { email, password } = parseResult.data;

        const players = await db
            .select()
            .from(playersTable)
            .where(eq(playersTable.email, email))
            .limit(1);

        if (players.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        const player = players[0];

        const isPasswordValid = await Bun.password.verify(password, player.password, 'bcrypt');

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        const tokens = generateTokens({
            playerId: player.id,
        });

        const { password: _, ...playerWithoutSensitiveData } = player;

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: dayInMS,
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: playerWithoutSensitiveData,
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
        });
    }
};
