import { UserRepo } from 'src/database/repositories';

export const registerUser = async (dto: {
    email: string;
    password: string;
    nickname: string;
}): Promise<Response> => {
    try {
        const { email, password, nickname } = dto;
        const existing = await UserRepo.findByEmailForAuth(email);
        if (existing) {
            return Response.json({ success: false, message: 'Email exists' }, { status: 409 });
        }

        const hashedPassword = await Bun.password.hash(password);
        const newUser = await UserRepo.create({
            email,
            passwordHash: hashedPassword,
            nickname,
        });

        return Response.json({ success: true, user: newUser }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
