import type { Request, Response } from 'express';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);

    try {
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: {},
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login.',
        });
    }
};
