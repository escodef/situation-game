import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { userTable } from 'src/database/schemas';
import { TokenPayload } from 'src/shared';

export const getProfile = async (_: Request, { userId }: TokenPayload): Promise<Response> => {
    try {
        const user = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

        return Response.json(
            {
                success: true,
                message: 'User fetched successfully',
                user: user[0],
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('getProfile() Error:', error);
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
