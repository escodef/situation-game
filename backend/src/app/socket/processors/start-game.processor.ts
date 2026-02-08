import { ServerWebSocket } from 'bun';
import { db } from 'src/database/data-source';
import { CardPackRepo, GameRepo, SituationPackRepo, UserRepo } from 'src/database/repositories';
import { GameRoundRepo } from 'src/database/repositories/game-round.repo';
import { ESocketOutcomeEvent, ISocketData, TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processStartGame: TSocketProcessor = async (ws: ServerWebSocket<ISocketData>) => {
    const client = await db.connect();

    try {
        const { userId } = ws.data;

        await client.query('BEGIN');

        const game = await GameRepo.findByOwnerId(userId, client);
        if (!game || game.status !== 'WAITING') return;

        const players = await UserRepo.getPlayersByGameId(game.id, client);
        if (players.length < 2) return;

        await GameRepo.updateStatus(game.id, 'STARTED');

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
    } catch {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
};
