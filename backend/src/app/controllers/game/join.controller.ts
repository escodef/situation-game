import { db, GameRepo, UserRepo } from 'database';
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
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const game = await GameRepo.findByCode('code' in body ? body.code : body.gameId, client);

        if (!game) {
            throw new NotFoundError('Игра не найдена');
        }

        if ('gameId' in body && !game.isOpen && !('code' in body)) {
            set.status = 400;
            throw new Error('В закрытую игру нужен код');
        }

        if (game.status !== EGameStatus.WAITING) {
            set.status = 400;
            throw new Error('Игра уже идёт');
        }

        const playersCount = await UserRepo.countPlayersInGame(game.id, client);
        if (playersCount >= game.maxPlayers) {
            set.status = 400;
            throw new Error('В игре нет свободных мест');
        }

        await UserRepo.joinGame(user.userId, game.id, client);

        await client.query('COMMIT');

        return {
            success: true,
            message: 'Joined successfully',
        };
    } catch (error) {
        await client.query('ROLLBACK');
        if (error instanceof NotFoundError) throw error;
        return { success: false, message: error instanceof Error ? error.message : 'Ошибка' };
    } finally {
        client.release();
    }
};
