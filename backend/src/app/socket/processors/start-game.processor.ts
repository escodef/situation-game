import { db, GameRepo, PlayerHandRepo, UserRepo } from 'database';
import { GameLoopService } from 'services';
import {
    EGameStatus,
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TSocketProcessor,
    type TStartGamePayload,
} from 'shared';

export const processStartGame: TSocketProcessor<TStartGamePayload> = async (ws: TElysiaWS) => {
    const client = await db.connect();

    const { userId } = ws.data;
    let gameIdToStart: string | null = null;

    try {
        await client.query('BEGIN');

        const game = await GameRepo.findByOwnerId(userId, client);
        if (!game || game.status !== EGameStatus.WAITING) return;

        const players = await UserRepo.getPlayersByGameId(game.id, client);
        if (players.length < 2) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Нужно минимум 2 игрока',
                }),
            );
            return;
        }

        await GameRepo.updateStatus(game.id, EGameStatus.STARTED, client);

        await PlayerHandRepo.fillDeck(game.id, client);

        await client.query('COMMIT');

        gameIdToStart = game.id;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('processStartGame() error:', error);
        ws.send(
            JSON.stringify({ event: ESocketOutcomeEvent.ERROR, data: 'Ошибка сервера при старте' }),
        );
    } finally {
        client.release();
    }

    if (gameIdToStart) {
        await GameLoopService.startNextRound(gameIdToStart);
    }
};
