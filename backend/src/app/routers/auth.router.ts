import Elysia from 'elysia';
import { LoginSchema, RegisterSchema } from 'src/shared';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth';

export const auth = new Elysia({
    prefix: '/auth',
    detail: { tags: ['Авторизация'], security: [{ bearerAuth: [] }] },
})
    .post('/login', (ctx) => loginUser(ctx), {
        body: LoginSchema,
    })
    .post('/register', ({ body }) => registerUser(body), {
        body: RegisterSchema,
    })
    .post('/refresh', (ctx) => refreshToken(ctx))
    .post('/logout', (ctx) => logoutUser(ctx));
