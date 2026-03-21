import { UserRepo } from 'src/database/repositories/user.repo';
import { TokenPayload } from 'src/shared';

export const getMe = async ({ userId }: TokenPayload): Promise<Response> => {
    try {
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
