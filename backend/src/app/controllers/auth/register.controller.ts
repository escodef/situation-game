import { UserRepo } from 'src/database/repositories';
import { ConflictError, type RegisterDto } from 'src/shared';

export const registerUser = async ({ body, set }: { body: RegisterDto; set: any }) => {
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
