import { SessionRepo, UserRepo } from 'database';
import type { Context } from 'elysia';
import { generateTokens, type LoginDto, UnauthorizedError } from 'shared';

export const loginUser = async ({
    body,
    cookie: { refreshToken },
}: Pick<Context, 'cookie'> & { body: LoginDto }) => {
    const { email, password } = body;

    const user = await UserRepo.findByEmailForAuth(email);

    if (!user) {
        throw new UnauthorizedError('Пользователь с такой почтой не найден');
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Неверный логин или пароль');
    }

    const tokens = generateTokens({ userId: user.id });

    await SessionRepo.create({
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    });

    refreshToken?.set({
        value: tokens.refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
    });

    const { password: _, ...userPublicData } = user;

    return {
        success: true,
        user: userPublicData,
        accessToken: tokens.accessToken,
    };
};
