import { inspect } from 'bun';
import { UserRepo } from 'src/database/repositories';
import { GameRepo } from 'src/database/repositories/game.repo';
import { TokenPayload } from 'src/shared';
import { EGameStatus } from 'src/shared/enums';
import z from 'zod';

const joinGameSchema = z
    .object({
        code: z
            .string()
            .length(6)
            .regex(/^[A-Za-z0-9]+$/)
            .optional(),
        gameId: z.uuid({ version: 'v4' }).optional(),
    })
    .refine((data) => data.code || data.gameId, {
        message: "Either 'code' or 'gameId' must be provided",
        path: ['code'],
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

        const { code, gameId } = result.data;

        const game = await GameRepo.findByCode(code ? code : gameId);

        if (!game) {
            return Response.json({ success: false, message: 'Игра не найдена' }, { status: 404 });
        }

        if (gameId && !game.isOpen) {
            return Response.json(
                { success: false, message: 'В закрытую игру нужен код' },
                { status: 400 },
            );
        }

        if (game.status !== EGameStatus.WAITING) {
            return Response.json({ success: false, message: 'Игра уже идёт' }, { status: 400 });
        }

        const playersCount = await UserRepo.countPlayersInGame(game.id);
        if (playersCount >= game.maxPlayers) {
            return Response.json(
                { success: false, message: 'В игре нет свободных мест' },
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
