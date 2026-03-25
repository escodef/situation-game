import { NotFoundError } from 'elysia';
import { UserRepo } from 'src/database/repositories';

export const getUser = async (userId: string) => {
    const user = await UserRepo.findById(userId);
    if (!user) {
        throw new NotFoundError('Пользователь с таким id не найдены');
    }
    return {
        success: true,
        message: 'User fetched successfully',
        user: user,
    };
};
