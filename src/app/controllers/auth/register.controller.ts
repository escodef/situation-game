import { Request, Response } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
});

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const parseResult = registerSchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: parseResult.error.flatten().fieldErrors,
        });
        return;
    }
};
