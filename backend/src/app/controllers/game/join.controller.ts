import { GameRepo, UserRepo } from 'src/database/repositories';
import { EGameStatus } from 'src/shared/enums';

export const joinGame = async ({ body, user, set }: { body: any; user: any; set: any }) => {
    const { code, gameId } = body;

    const game = await GameRepo.findByCode(code ?? gameId);

    if (!game) {
        set.status = 404;
        return { success: false, message: 'Игра не найдена' };
    }

    if (gameId && !game.isOpen && !code) {
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
