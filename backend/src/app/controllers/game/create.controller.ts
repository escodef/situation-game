import { GameRepo } from 'src/database/repositories';
import { type CreateGameDto, generateRandomString, type TokenPayload } from 'src/shared';

export const createGame = async ({
    body,
    user,
    set,
}: {
    body: CreateGameDto;
    user: TokenPayload;
    set: any;
}) => {
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
