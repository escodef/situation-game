import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from 'src';
import { playersTable } from 'src/database';
import { z } from 'zod';

const registerSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    nickname: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const parseResult = registerSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parseResult.error).errors,
            });
            return;
        }

        const { email, password, nickname } = parseResult.data;

        const existingUser = await db
            .select()
            .from(playersTable)
            .where(eq(playersTable.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newPlayer = await db
            .insert(playersTable)
            .values({
                email,
                password: hashedPassword,
                nickname,
            })
            .returning();

        const { password: _, ...playerWithoutPassword } = newPlayer[0];

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: playerWithoutPassword,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
