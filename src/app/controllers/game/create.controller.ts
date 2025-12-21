import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import { TokenPayload } from 'src/shared';
import { EGameStatus } from 'src/shared/enums';
import { generateRandomString } from 'src/shared/utils';

export const createGame = async (
    req: Request,
    user: TokenPayload
): Promise<Response> => {
    try {
        const body = await req.json();
        const code = generateRandomString();

        const [newGame] = await db
            .insert(gamesTable)
            .values({
                code: code,
                ownerId: user.playerId,
                maxPlayers: body.maxPlayers || 4,
                status: EGameStatus.WAITING,
            })
            .returning();

        return Response.json(
            {
                success: true,
                data: {
                    gameId: newGame.id,
                    code: newGame.code,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
};
