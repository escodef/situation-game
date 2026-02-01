import { inspect } from 'bun';
import { GamesRepo } from 'src/database/repositories/game.repo';
import { TokenPayload } from 'src/shared';
import { generateRandomString } from 'src/shared/utils';
import z from 'zod';

const createGameSchema = z.object({
    maxPlayers: z.int().min(2, 'Must be at least 2 players in the room'),
    isOpen: z.boolean().default(false),
});

export const createGame = async (req: Request, user: TokenPayload): Promise<Response> => {
    try {
        const body = await req.json();
        const parseResult = createGameSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json(
                { success: false, errors: z.treeifyError(parseResult.error) },
                { status: 400 },
            );
        }
        const code = generateRandomString();

        const newGame = await GamesRepo.create({
            code: code,
            ownerId: user.userId,
            maxPlayers: parseResult.data.maxPlayers,
            isOpen: parseResult.data.isOpen,
        });

        return Response.json(
            {
                success: true,
                data: newGame,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('createGame() error:');
        console.error(inspect(error));
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
};
