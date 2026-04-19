import { GameRepo, UserRepo } from 'database';
import { type Context, NotFoundError } from 'elysia';
import { EGameStatus, type JoinGameDto, type TokenPayload } from 'shared';

export const joinGame = async ({
    body,
    user,
    set,
}: Pick<Context, 'set'> & {
    body: JoinGameDto;
    user: TokenPayload;
}) => {
    const game = await GameRepo.findByCode('code' in body ? body.code : body.gameId);

    if (!game) {
        throw new NotFoundError('Игра не найдена');
    }

    if ('gameId' in body && !game.isOpen && !('code' in body)) {
        set.status = 400;
        return { success: false, message: 'В закрытую игру нужен код' };
    }

    if (game.status !== EGameStatus.WAITING) {
        set.status = 400;
        return { success: false, message: 'Игра уже идёт' };
    }

    const playersCount = await UserRepo.countPlayersInGame(game.id);
    if (playersCount >= game.maxPlayers) {
        set.status = 400;
        return { success: false, message: 'В игре нет свободных мест' };
    }

    await UserRepo.joinGame(user.userId, game.id);

    return {
        success: true,
        message: 'Joined successfully',
        gameId: game.id,
    };
};
