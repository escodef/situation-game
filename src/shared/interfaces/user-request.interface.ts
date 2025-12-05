import { Request } from "express";
import { TokenPayload } from "./jwt.interface";

export interface UserRequest extends Request {
    player: TokenPayload | string;
}
