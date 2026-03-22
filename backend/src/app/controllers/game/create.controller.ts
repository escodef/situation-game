import { GameRepo } from 'src/database/repositories/game.repo';
import { generateRandomString } from 'src/shared';

export const createGame = async ({ body, user, set }: { body: any; user: any; set: any }) => {
    const code = generateRandomString();

    const newGame = await GameRepo.create({
        code,
        ownerId: user.userId,
        maxPlayers: body.maxPlayers,
        maxRounds: body.maxRounds,
        isOpen: body.isOpen,
        situationPacksIds: body.situationPacksIds,
        cardPacksIds: body.cardPacksIds,
    });

    set.status = 201;
    return {
        success: true,
        data: newGame,
    };
};
