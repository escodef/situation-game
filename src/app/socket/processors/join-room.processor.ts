import { ServerWebSocket } from 'bun';
import { SocketData } from '../interfaces/message.interface';
import { websocketInstance } from '../websocket.manager';

export const processJoinRoom = async (
    ws: ServerWebSocket<SocketData>,
    data: { roomId: string }
) => {
    websocketInstance.joinRoom(ws.data.userId, data.roomId);
    websocketInstance.sendToRoom(data.roomId, {
        event: 'user_joined',
        data: { userId: ws.data.userId },
    });
};
