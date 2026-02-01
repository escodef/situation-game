import { UserRepo } from 'src/database/repositories/user.repo';
import { TokenPayload } from 'src/shared';
import z from 'zod';

const uuidSchema = z.uuid({ version: 'v4' });

export const getMe = async (_: Request, { userId }: TokenPayload): Promise<Response> => {
    try {
        const validation = uuidSchema.safeParse(userId);

        if (!validation.success) {
            return Response.json(
                { success: false, message: 'Invalid UUID format' },
                { status: 400 },
            );
        }
        const user = await UserRepo.findById(userId);

        if (!user) {
            return Response.json(
                { success: false, message: 'No user found with this id' },
                { status: 400 },
            );
        }

        return Response.json(
            {
                success: true,
                message: 'User fetched successfully',
                user,
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
