import { UserRepo } from 'src/database/repositories/user.repo';
import { generateTokens } from 'src/shared';

export const loginUser = async ({
    body,
    cookie: { refreshToken },
    set,
}: {
    body: any;
    cookie: any;
    set: any;
}) => {
    const { email, password } = body;

    const user = await UserRepo.findByEmailForAuth(email);

    if (!user) {
        set.status = 401;
        return { success: false, message: 'Invalid credentials' };
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
        set.status = 401;
        return { success: false, message: 'Invalid credentials' };
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
