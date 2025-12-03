import { Router } from 'express';
import { loginUser } from '../controllers/auth/login.controller';
import { refreshToken } from '../controllers/auth/refresh.controller';
import { registerUser } from '../controllers/auth/register.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

export default router;
