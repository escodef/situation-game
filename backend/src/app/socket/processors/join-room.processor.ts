import type { ServerWebSocket } from 'bun';
import { UserRepo } from 'src/database/repositories/user.repo';
import { ESocketOutcomeEvent } from 'src/shared/enums';
import { ISocketData } from '../types';
import { websocketInstance } from '../websocket.manager';

export const processJoinGame = async (
    ws: ServerWebSocket<ISocketData>,
    data: { gameId: string },
) => {
    websocketInstance.joinRoom(ws.data.userId, data.gameId);
    await UserRepo.joinGame(ws.data.userId, data.gameId);
    websocketInstance.sendToRoom(data.gameId, {
        event: ESocketOutcomeEvent.PLAYER_JOINED,
        data: { userId: ws.data.userId },
    });
};
