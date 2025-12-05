import { Response } from 'express';
import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import { UserRequest } from 'src/shared';
import z from 'zod';

const createDto = z.object({
    maxPlayers: z.int().min(2, 'Must be at least 2').max(8, 'Value too high - 8 players max'),
});

export const createGame = async (req: UserRequest, res: Response): Promise<void> => {
    const parseResult = createDto.safeParse(req.body);

    if (!parseResult.success) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parseResult.error).errors,
        });
        return;
    }

    const game = await db
        .insert(gamesTable)
        .values({
            maxPlayers: parseResult.data.maxPlayers,
        })
        .returning();

    res.status(201).json({
        success: true,
        message: 'Game created successfully',
        game,
    });
};
