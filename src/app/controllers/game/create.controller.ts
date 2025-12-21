import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import { TokenPayload } from 'src/shared';
import { generateCode } from 'src/shared/utils/code';
import z from 'zod';

const createDto = z.object({
    maxPlayers: z.int().min(2, 'Must be at least 2').max(8, 'Value too high - 8 players max'),
});

export const createGame = async (req: Request, user: TokenPayload): Promise<Response> => {
    const body = await req.json();

    const parseResult = createDto.safeParse(body);

    if (!parseResult.success) {
        return Response.json(
            {
                success: false,
                message: 'Validation failed',
                errors: z.treeifyError(parseResult.error),
            },
            { status: 422 },
        );
    }
    const code = generateCode();

    await db.insert(gamesTable).values({
        maxPlayers: parseResult.data.maxPlayers,
        ownerId: user.userId,
        code,
    });

    return Response.json(
        {
            success: true,
            message: 'Game created successfully',
            code,
        },
        { status: 201 },
    );
};
