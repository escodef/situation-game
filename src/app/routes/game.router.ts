import { Router } from "express";
import { authenticate } from "src/shared/middlewares";
import { createGame } from "../controllers/game/create.controller";

const gameRouter = Router();

gameRouter.post('/game', authenticate, createGame);
