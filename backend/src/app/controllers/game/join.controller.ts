import { inspect } from 'bun';
import { GamesRepo } from 'src/database/repositories/game.repo';
import { TokenPayload } from 'src/shared';
import { EGameStatus } from 'src/shared/enums';

export const joinGame = async (req: Request, user: TokenPayload): Promise<Response> => {
    try {
        const { code } = await req.json();

        const game = await GamesRepo.findByCode(code);

        if (!game) {
            return Response.json({ success: false, message: 'Room not found' }, { status: 404 });
        }

        if (game.status !== EGameStatus.WAITING) {
            return Response.json(
                { success: false, message: 'Game already started' },
                { status: 400 },
            );
        }

        await db.update(userTable).set({ gameId: game.id }).where(eq(userTable.id, user.playerId));

        return Response.json({
            success: true,
            message: 'Joined successfully',
            gameId: game.id,
        });
    } catch (error) {
        console.error('joinGame() error:');
        console.error(inspect(error));
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
