import { db, UserRepo } from 'database';
import {
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TLeaveGamePayload,
    type TSocketProcessor,
} from 'shared';
import { sendToGame } from '../websocket.manager';

export const processLeaveGame: TSocketProcessor<TLeaveGamePayload> = async (ws: TElysiaWS) => {
    const { userId } = ws.data;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const user = await UserRepo.findWithGame(userId, client);

        if (!user?.gameId) {
            throw new Error();
        }

        await UserRepo.leaveGame(userId, client);

        sendToGame(
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
        console.error('processLeaveGame() error:', error);
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка сервера при выходе из игры',
            }),
        );
    } finally {
        client.release();
    }
};
