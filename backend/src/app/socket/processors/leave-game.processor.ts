import { ServerWebSocket } from 'bun';
import { db } from 'src/database/data-source';
import { UserRepo } from 'src/database/repositories';
import { ESocketOutcomeEvent, ISocketData, TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processLeaveGame: TSocketProcessor = async (ws: ServerWebSocket<ISocketData>) => {
    const { userId } = ws.data;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const user = await UserRepo.findWithGame(userId, client);

        await UserRepo.leaveGame(userId, client);

        websocketInstance.sendToGame(
            ws,
            user.gameId,
            {
                event: ESocketOutcomeEvent.PLAYER_LEFT,
                data: { userId },
            },
            true,
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('PickCard Error:', error);
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка сервера при выборе карты',
            }),
        );
    } finally {
        client.release();
    }
};
