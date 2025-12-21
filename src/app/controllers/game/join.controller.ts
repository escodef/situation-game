import { eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { gamesTable, userTable } from 'src/database/schemas';
import { TokenPayload } from 'src/shared';

export const joinGame = async (
    req: Request,
    user: TokenPayload
): Promise<Response> => {
    try {
        const { code } = await req.json();

        const games = await db
            .select()
            .from(gamesTable)
            .where(eq(gamesTable.code, code))
            .limit(1);
        const game = games[0];

        if (!game) {
            return Response.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }

        if (game.status !== 'waiting') {
            return Response.json(
                { success: false, message: 'Game already started' },
                { status: 400 }
            );
        }

        await db
            .update(userTable)
            .set({ gameId: game.id })
            .where(eq(userTable.id, user.playerId));

        return Response.json({
            success: true,
            message: 'Joined successfully',
            gameId: game.id,
        });
    } catch (error) {
        return Response.json(
            { success: false, message: 'Internal error' },
            { status: 500 }
        );
    }
};
