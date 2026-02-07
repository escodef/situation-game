import { inspect } from 'bun';
import { UserRepo } from 'src/database/repositories';
import { GameRepo } from 'src/database/repositories/game.repo';
import { TokenPayload } from 'src/shared';
import { EGameStatus } from 'src/shared/enums';
import z from 'zod';

const joinGameSchema = z.object({
    code: z
        .string()
        .length(6)
        .regex(/^[A-Za-z0-9]+$/),
});

export const joinGame = async (req: Request, user: TokenPayload): Promise<Response> => {
    try {
        const body = await req.json();

        const result = joinGameSchema.safeParse(body);

        if (!result.success) {
            return Response.json(
                { success: false, error: z.flattenError(result.error) },
                { status: 400 },
            );
        }

        const { code } = result.data;

        const game = await GameRepo.findByCode(code);

        if (!game) {
            return Response.json({ success: false, message: 'Room not found' }, { status: 404 });
        }

        if (game.status !== EGameStatus.WAITING) {
            return Response.json(
                { success: false, message: 'Game already started' },
                { status: 400 },
            );
        }

        await UserRepo.joinGame(user.userId, game.id);

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
