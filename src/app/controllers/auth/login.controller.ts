import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from 'src';
import { dayInMS } from 'src/constants/constants';
import { usersTable } from 'src/database';
import { generateTokens } from 'src/utils/jwt';
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

        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (users.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password || '');

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
        });

        const { password: _, ...userWithoutSensitiveData } = user;

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: dayInMS
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userWithoutSensitiveData,
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

