import { NotFoundError } from 'elysia';
import { UserRepo } from 'src/database/repositories';
import type { TokenPayload } from 'src/shared';

export const getMe = async ({ user }: { user: TokenPayload }) => {
    const userData = await UserRepo.findById(user.userId);

    if (!userData) {
        throw new NotFoundError('Пользователь с таким id не найдены');
    }

    return {
        success: true,
        user: userData,
    };
};
