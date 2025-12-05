import { Router } from "express";
import { createGame } from "../controllers/game/create.controller";

const gameRouter = Router();

gameRouter.post('/game', createGame);
