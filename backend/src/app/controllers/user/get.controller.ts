import { UserRepo } from 'database';
import { NotFoundError } from 'elysia';

export const getUser = async (id: string) => {
    const user = await UserRepo.findById(id);
    if (!user) {
        throw new NotFoundError('Пользователь с таким id не найден');
    }
    return {
        success: true,
        message: 'User fetched successfully',
        user: user,
    };
};
