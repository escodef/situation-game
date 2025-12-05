import { Router } from "express";
import { authenticate } from "src/shared/middlewares";
import { createGame } from "../controllers/game/create.controller";
import { getGame } from "../controllers/game/get.controller";

const gameRouter = Router();

gameRouter.get('/game/:id', authenticate, getGame);
gameRouter.post('/game', authenticate, createGame);

export default gameRouter;
