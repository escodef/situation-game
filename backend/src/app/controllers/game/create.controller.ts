import { GameRepo } from 'database';
import type { Context } from 'elysia';
import { type CreateGameDto, generateRandomString, type TokenPayload } from 'shared';

export const createGame = async ({
    body,
    user,
    set,
}: Pick<Context, 'set'> & {
    body: CreateGameDto;
    user: TokenPayload;
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
