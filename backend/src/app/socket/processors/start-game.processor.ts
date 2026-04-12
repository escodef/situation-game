import { db } from 'database/data-source';
import { CardPackRepo, GameRepo, SituationPackRepo, UserRepo } from 'database/repositories';
import { GameRoundRepo } from 'database/repositories/game-round.repo';
import { GameLoopService } from 'services';
import {
    EGameStatus,
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TSocketProcessor,
    type TStartGamePayload,
} from 'shared';
import { websocketInstance } from '../websocket.manager';

export const processStartGame: TSocketProcessor<TStartGamePayload> = async (ws: TElysiaWS) => {
    const client = await db.connect();

    try {
        const { userId } = ws.data;

        await client.query('BEGIN');

        const game = await GameRepo.findByOwnerId(userId, client);
        if (!game || game.status !== EGameStatus.WAITING) return;

        const players = await UserRepo.getPlayersByGameId(game.id, client);
        if (players.length < 2) return;

        await GameRepo.updateStatus(game.id, EGameStatus.STARTED);

        const situation = await SituationPackRepo.getRandomForGame(game.id, client);

        const endsAt = new Date(Date.now() + 60000);
        const round = await GameRoundRepo.create(
            {
                gameId: game.id,
                roundNumber: 1,
                situationId: situation.id,
                endsAt,
            },
            client,
        );
        await GameLoopService.schedulePickingEnd(game.id, round.id, 60000);

        await CardPackRepo.distributeInitialCards(game.id, client);

        websocketInstance.sendToGame(
            ws,
            game.id,
            {
                event: ESocketOutcomeEvent.GAME_STARTED,
                data: {
                    roundId: round.id,
                    situationText: situation.text,
                    endsAt: endsAt.toISOString(),
                },
            },
            true,
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('processStartGame() error:', error);
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка сервера при попытке начать игру',
            }),
        );
    } finally {
        client.release();
    }
};
