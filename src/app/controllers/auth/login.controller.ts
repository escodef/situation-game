import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { refreshTokensTable, userTable } from 'src/database/schemas';
import { dayInMS } from 'src/shared';
import { generateTokens } from 'src/shared/utils/jwt.util';
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
                { success: false, errors: parseResult.error.flatten() },
                { status: 400 },
            );
        }

        const { email, password } = parseResult.data;

        const user = await db.query.userTable.findFirst({
            where: eq(userTable.email, email),
            with: {
                roles: {
                    with: {
                        role: true,
                    },
                },
            },
        });

        if (!user || !user.password) {
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

        const roleNames = user.roles.map((r) => r.role.name);

        const tokens = generateTokens({
            userId: user.id,
            roles: roleNames,
        });

        await db.insert(refreshTokensTable).values({
            userId: user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + dayInMS * 30),
        });

        const { password: _, roles: __, ...userPublicData } = user;

        const response = Response.json(
            {
                success: true,
                user: { ...userPublicData, roles: roleNames },
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
