import { inspect } from 'bun';
import { GameRepo } from 'src/database/repositories/game.repo';
import { generateRandomString, TokenPayload } from 'src/shared';
import z from 'zod';

const createGameSchema = z.object({
    maxPlayers: z.int().min(2, 'Для игры нужно минимум 2 игрока'),
    maxRounds: z.int().min(1, 'В игре должен быть хотя бы 1 раунд'),
    isOpen: z.boolean().default(false),
    situationPacksIds: z.array(z.uuid()).min(1, 'Нужно указать минимум один набор ситуаций'),
    cardPacksIds: z.array(z.uuid()).min(1, 'Нужно выбрать минимум один набор карточек'),
});

export const createGame = async (req: Request, user: TokenPayload): Promise<Response> => {
    try {
        const body = await req.json();
        const parseResult = createGameSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json(
                { success: false, error: z.flattenError(parseResult.error) },
                { status: 400 },
            );
        }
        const code = generateRandomString();

        const newGame = await GameRepo.create({
            code: code,
            ownerId: user.userId,
            maxPlayers: parseResult.data.maxPlayers,
            maxRounds: parseResult.data.maxRounds,
            isOpen: parseResult.data.isOpen,
            situationPacksIds: parseResult.data.situationPacksIds,
            cardPacksIds: parseResult.data.cardPacksIds,
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
