import Elysia from 'elysia';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth';

export const auth = new Elysia({ prefix: '/auth' })
    .post('/login', ({ request }) => loginUser(request))
    .post('/register', ({ request }) => registerUser(request))
    .post('/refresh', ({ request }) => refreshToken(request))
    .post('/logout', ({ request }) => logoutUser(request));
