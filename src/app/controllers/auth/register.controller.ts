import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { rolesTable, usersToRolesTable, userTable } from 'src/database/schemas';
import { z } from 'zod';

const registerSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    nickname: z.string().min(4, 'Name is required'),
    email: z.email('Invalid email').trim().toLowerCase(),
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

        return await db.transaction(async (tx) => {
            const existingUser = await tx
                .select()
                .from(userTable)
                .where(eq(userTable.email, email))
                .limit(1);
            if (existingUser.length > 0) {
                return Response.json(
                    { success: false, message: 'Email already exists' },
                    { status: 409 },
                );
            }

            const hashedPassword = await Bun.password.hash(password);

            const result = await tx
                .insert(userTable)
                .values({
                    email,
                    password: hashedPassword,
                    nickname,
                })
                .returning();

            const newUser = Array.isArray(result) ? result[0] : null;

            const [playerRole] = await tx
                .select()
                .from(rolesTable)
                .where(eq(rolesTable.name, 'user'))
                .limit(1);

            if (playerRole) {
                await tx.insert(usersToRolesTable).values({
                    userId: newUser.id,
                    roleId: playerRole.id,
                });
            }

            const { password: _, ...userWithoutPassword } = newUser;
            return Response.json({ success: true, user: userWithoutPassword }, { status: 201 });
        });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
