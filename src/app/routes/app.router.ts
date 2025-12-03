import express from 'express';
import { loginUser } from '../controllers/auth/login.controller';
import { registerUser } from '../controllers/auth/register.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
