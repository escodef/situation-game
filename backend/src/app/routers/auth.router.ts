import Elysia from 'elysia';
import { LoginSchema, LogoutSchema, RefreshSchema, RegisterSchema } from 'shared';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth';

export const auth = new Elysia({
    prefix: '/auth',
    detail: { tags: ['Авторизация'] },
})
    .post('/login', (ctx) => loginUser(ctx), {
        body: LoginSchema,
    })
    .post('/register', (ctx) => registerUser(ctx), {
        body: RegisterSchema,
    })
    .post('/refresh', (ctx) => refreshToken(ctx), {
        cookie: RefreshSchema,
    })
    .post('/logout', (ctx) => logoutUser(ctx), {
        headers: LogoutSchema,
    });
