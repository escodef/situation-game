import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { userTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens } from 'src/shared/utils/jwt';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginUser = async (req: Request): Promise<Response> => {
    try {
        const body = await req.json();
        const parseResult = loginSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json({
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parseResult.error),
            }, { status: 400 });
        }

        const { email, password } = parseResult.data;

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email))
            .limit(1);

        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'Invalid email or password',
            }, { status: 401 });
        }

        const user = users[0];
        const isPasswordValid = await Bun.password.verify(password, user.password, 'bcrypt');

        if (!isPasswordValid) {
            return Response.json({
                success: false,
                message: 'Invalid email or password',
            }, { status: 401 });
        }

        const tokens = generateTokens({
            userId: user.id,
        });

        const { password: _, ...userWithoutSensitiveData } = user;

        const headers = new Headers();
        headers.append('Set-Cookie', `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${dayInMS / 1000}`);

        return Response.json({
            success: true,
            message: 'Login successful',
            user: userWithoutSensitiveData,
            accessToken: tokens.accessToken,
        }, { 
            status: 200,
            headers 
        });

    } catch (error) {
        console.error('Login Error:', error);
        return Response.json({
            success: false,
            message: 'Internal server error during login',
        }, { status: 500 });
    }
};