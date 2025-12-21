import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { userTable } from 'src/database/schemas';
import { z } from 'zod';

const registerSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    nickname: z.string().min(4, 'Name is required'),
    email: z.email('Invalid email'),
});

export const registerUser = async (req: Request): Promise<Response> => {
    try {
        const body = await req.json();
        const parseResult = registerSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: z.treeifyError(parseResult.error),
                },
                { status: 422 },
            );
        }

        const { email, password, nickname } = parseResult.data;

        const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: 'User with this email already exists',
                },
                { status: 409 },
            );
        }

        const hashedPassword = await Bun.password.hash(password, {
            algorithm: 'bcrypt',
            cost: 10,
        });

        const newUser = await db
            .insert(userTable)
            .values({
                email,
                password: hashedPassword,
                nickname,
            })
            .returning();

        const { password: _, ...userWithoutPassword } = newUser[0];

        return Response.json(
            {
                success: true,
                message: 'User registered successfully',
                user: userWithoutPassword,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
