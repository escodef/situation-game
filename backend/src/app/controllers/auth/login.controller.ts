import { UserRepo } from 'database/repositories';
import type { Context } from 'elysia';
import { generateTokens, type LoginDto, UnauthorizedError } from 'shared';

export const loginUser = async ({
    body,
    cookie: { refreshToken },
}: Pick<Context, 'set' | 'cookie'> & { body: LoginDto }) => {
    const { email, password } = body;

    const user = await UserRepo.findByEmailForAuth(email);

    if (!user || !refreshToken) {
        throw new UnauthorizedError('Неверный логин или пароль');
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = generateTokens({ userId: user.id });

    refreshToken.set({
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
