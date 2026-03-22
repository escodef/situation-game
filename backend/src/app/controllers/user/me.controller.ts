import { UserRepo } from 'src/database/repositories';

export const getMe = async ({ user, error }: any) => {
    try {
        const userData = await UserRepo.findById(user.id);

        if (!userData) {
            return error(400, {
                success: false,
                message: 'Пользователь с таким id не найден',
            });
        }

        return {
            success: true,
            user: userData,
        };
    } catch (e) {
        console.error('getProfile() Error:', e);
        return error(500, {
            success: false,
            message: 'Internal server error',
        });
    }
};
