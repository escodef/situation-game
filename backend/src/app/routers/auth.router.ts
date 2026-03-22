import Elysia, { t } from 'elysia';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth';

export const auth = new Elysia({ prefix: '/auth' })
    .post(
        '/login',
        ({ body, cookie: { refreshToken }, set }) =>
            loginUser({
                body,
                cookie: { refreshToken },
                set,
            }),
        {
            body: t.Object({
                email: t.String({
                    format: 'email',
                    default: (v: string) => v.toLowerCase().trim(),
                    error: 'Invalid email',
                }),
                password: t.String({
                    minLength: 8,
                    error: 'Password must be at least 8 characters',
                }),
            }),
        },
    )
    .post('/register', ({ body }) => registerUser(body), {
        body: t.Object({
            password: t.String({
                minLength: 8,
                errorMessage: 'Password must be at least 8 characters',
            }),
            nickname: t.String({
                minLength: 4,
                errorMessage: 'Name is required',
            }),
            email: t.String({
                format: 'email',
                transform: ['toLowerCase', 'trim'],
                errorMessage: 'Invalid email',
            }),
        }),
    })
    .post('/refresh', ({ request }) => refreshToken(request))
    .post('/logout', ({ request }) => logoutUser(request));
