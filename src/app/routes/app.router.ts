import { Router } from 'express';
import authRouter from './auth.router';

const appRouter = Router();

appRouter.post('/auth', authRouter);

export default appRouter;
