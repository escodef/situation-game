import { Router } from 'express';
import authRouter from './auth.router';
import gameRouter from './game.router';

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/game', gameRouter);

export default appRouter;
