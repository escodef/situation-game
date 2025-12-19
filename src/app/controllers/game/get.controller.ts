import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import z from 'zod';

const getGameDto = z.object({
    id: z.uuid(),
});

export const getGame = async (req: Request): Promise<Response> => {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('id');

        const parseResult = getGameDto.safeParse({ id: gameId });

        if (!parseResult.success) {
            return Response.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: z.treeifyError(parseResult.error).errors,
                },
                { status: 422 },
            );
        }

        const game = await db
            .select()
            .from(gamesTable)
            .where(eq(gamesTable.id, parseResult.data.id))
            .limit(1);

        if (game.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: 'Game not found',
                },
                { status: 404 },
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Game fetched successfully',
                game: game[0],
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Get Game Error:', error);
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
