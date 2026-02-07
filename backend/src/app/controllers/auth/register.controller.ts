import { UserRepo } from 'src/database/repositories';
import { z } from 'zod';

const registerSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    nickname: z.string().min(4, 'Name is required'),
    email: z.email('Invalid email').trim().toLowerCase(),
});

export const registerUser = async (req: Request): Promise<Response> => {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return Response.json(
                { success: false, error: z.flattenError(result.error) },
                { status: 400 },
            );
        }

        const { email, password, nickname } = result.data;
        const existing = await UserRepo.findByEmailForAuth(email);
        if (existing) {
            return Response.json({ success: false, message: 'Email exists' }, { status: 409 });
        }

        const hashedPassword = await Bun.password.hash(password);
        const newUser = await UserRepo.create({
            email,
            passwordHash: hashedPassword,
            nickname,
        });

        return Response.json({ success: true, user: newUser }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
