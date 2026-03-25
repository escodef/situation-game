import { type Static, t } from 'elysia';

export const RegisterSchema = t.Object({
    password: t.String({
        minLength: 8,
        errorMessage: 'Минимальная длина пароля - 8 символов',
    }),
    nickname: t.String({
        minLength: 4,
        errorMessage: 'Минимальная длина ника - 4 символов',
    }),
    email: t.String({
        format: 'email',
        transform: ['toLowerCase', 'trim'],
        errorMessage: 'Неверный формат почты',
    }),
});

export const LoginSchema = t.Object({
    email: t.String({
        format: 'email',
        transform: ['toLowerCase', 'trim'],
        error: 'Неверный формат почты',
    }),
    password: t.String({
        minLength: 8,
        error: 'Минимальная длина пароля - 8 символов',
    }),
});

export const LogoutSchema = t.Object({
    authorization: t.String({ examples: ['Bearer: <Access токен>'] }),
});

export const RefreshSchema = t.Cookie({
    refreshToken: t.String({ description: 'Рефреш токен' }),
});

export type RegisterDto = Static<typeof RegisterSchema>;
export type LoginDto = Static<typeof LoginSchema>;
export type LogoutDto = Static<typeof LogoutSchema>;
