import { UserRepo } from 'database';
import { NotFoundError } from 'elysia';
import type { TokenPayload } from 'shared';

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
