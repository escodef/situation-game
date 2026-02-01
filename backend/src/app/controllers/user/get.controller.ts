import { UserRepo } from 'src/database/repositories/user.repo';

export const getUser = async (_: Request, userId: string): Promise<Response> => {
    try {
        const user = await UserRepo.findById(userId);
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
