import { Request, Response } from "express";
import z from "zod";

const createDto = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    nickname: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
});

export const createGame = async (
    req: Request,
    res: Response
): Promise<void> => {

}