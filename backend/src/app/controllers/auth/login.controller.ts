import { UserRepo } from 'src/database/repositories/user.repo';
import { dayInMS, generateTokens } from 'src/shared';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.email('Invalid email').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginUser = async (req: Request): Promise<Response> => {
    try {
        const body = await req.json();
        const parseResult = loginSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json(
                { success: false, errors: z.treeifyError(parseResult.error) },
                { status: 400 },
            );
        }

        const { email, password } = parseResult.data;

        const user = await UserRepo.findByEmailForAuth(email);

        if (!user) {
            return Response.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 },
            );
        }

        const isPasswordValid = await Bun.password.verify(password, user.password);
        if (!isPasswordValid) {
            return Response.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 },
            );
        }

        const tokens = generateTokens({
            userId: user.id,
            roles: user.roles,
        });

        const { password: _, ...userPublicData } = user;

        const response = Response.json(
            {
                success: true,
                user: { ...userPublicData },
                accessToken: tokens.accessToken,
            },
            { status: 200 },
        );

        response.headers.append(
            'Set-Cookie',
            `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${(dayInMS * 30) / 1000}`,
        );

        return response;
    } catch (error) {
        console.error('Login Error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
