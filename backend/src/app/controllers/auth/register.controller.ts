import { UserRepo } from 'database/repositories';
import type { Context } from 'elysia';
import { ConflictError, type RegisterDto } from 'shared';

export const registerUser = async ({ body, set }: Pick<Context, 'set'> & { body: RegisterDto }) => {
    const { email, password, nickname } = body;
    const existing = await UserRepo.findByEmailForAuth(email);
    if (existing) {
        throw new ConflictError('Пользователь с такой почтой уже существует.');
    }

    const hashedPassword = await Bun.password.hash(password);
    const newUser = await UserRepo.create({
        email,
        passwordHash: hashedPassword,
        nickname,
    });

    set.status = 201;

    return { success: true, user: newUser };
};
