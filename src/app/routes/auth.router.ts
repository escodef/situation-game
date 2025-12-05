import { Router } from 'express';
import { loginUser } from '../controllers/auth/login.controller';
import { refreshToken } from '../controllers/auth/refresh.controller';
import { registerUser } from '../controllers/auth/register.controller';

const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/refresh', refreshToken);

export default authRouter;
