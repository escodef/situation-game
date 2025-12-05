import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import { UserRequest } from 'src/shared';
import z from 'zod';

const createDto = z.object({
    id: z.int(),
});

export const getGame = async (req: UserRequest, res: Response): Promise<void> => {
    const parseResult = createDto.safeParse(req.params);

    if (!parseResult.success) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: z.treeifyError(parseResult.error).errors,
        });
        return;
    }

    const game = await db
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.id, parseResult.data.id))
        .limit(1);

    res.status(200).json({
        success: true,
        message: 'Game created successfully',
        game
    });
};
