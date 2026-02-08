import { ServerWebSocket } from 'bun';
import { UserRepo } from 'src/database/repositories';
import { ISocketData, TSocketProcessor } from 'src/shared';
import { ESocketOutcomeEvent } from 'src/shared/enums';
import { websocketInstance } from '../websocket.manager';

export const processJoinGame: TSocketProcessor<{ gameId: string }> = async (
    ws: ServerWebSocket<ISocketData>,
    data: { gameId: string },
) => {
    const { userId } = ws.data;
    const { gameId } = data;

    const user = await UserRepo.findById(userId);

    if (!user || user.gameId !== gameId) {
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Вы не являетесь участником этой игры',
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
