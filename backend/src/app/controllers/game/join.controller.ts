import { db, GameRepo, UserRepo } from 'database';
import { type Context, NotFoundError } from 'elysia';
import { BadRequestError, EGameStatus, type JoinGameDto, type TokenPayload } from 'shared';

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
            throw new BadRequestError('В закрытую игру нужен код');
            
        }

        if (game.status !== EGameStatus.WAITING) {
            throw new BadRequestError('Игра уже идёт');
        }

        const playersCount = await UserRepo.countPlayersInGame(game.id, client);
        if (playersCount >= game.maxPlayers) {
            throw new BadRequestError('В игре нет свободных мест');
        }

        await UserRepo.joinGame(user.userId, game.id, client);

        await client.query('COMMIT');

        return {
            success: true,
            message: 'Joined successfully',
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
