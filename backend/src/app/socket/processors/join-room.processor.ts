import type { ServerWebSocket } from 'bun';
import { UserRepo } from 'src/database/repositories/user.repo';
import { ISocketData } from '../types';

export const processJoinGame = async (
    ws: ServerWebSocket<ISocketData>,
    data: { gameId: string },
) => {
    await UserRepo.joinGame(ws.data.userId, data.gameId);
};
