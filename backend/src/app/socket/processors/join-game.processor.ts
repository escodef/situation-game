import { UserRepo } from 'database/repositories';
import type { TElysiaWS, TJoinGamePayload, TSocketProcessor } from 'shared';
import { ESocketOutcomeEvent } from 'shared/enums';
import { websocketInstance } from '../websocket.manager';

export const processJoinGame: TSocketProcessor<TJoinGamePayload> = async (ws: TElysiaWS, data) => {
    const { userId } = ws.data;
    const { gameId } = data;

    const user = await UserRepo.findById(userId);

    if (!user?.gameId || user.gameId !== gameId) {
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка при попытке зайти в игру',
            }),
        );
        return;
    }

    websocketInstance.joinGame(ws, gameId);

    websocketInstance.sendToGame(ws, gameId, {
        event: ESocketOutcomeEvent.PLAYER_JOINED,
        data: {
            userId: user.id,
            nickname: user.nickname,
            score: user.score,
        },
    });

    console.debug(`User ${user.nickname} joined socket in game ${gameId}`);
};
