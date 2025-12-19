import { ServerWebSocket } from "bun";
import { SocketData } from "../interfaces/message.interface";
import { WebsocketManager } from "../websocket.manager";

const wsManager = WebsocketManager.getInstance();

export const processJoinRoom = async (ws: ServerWebSocket<SocketData>, data: { roomId: string }) => {
    wsManager.joinRoom(ws.data.userId, data.roomId);
    
    wsManager.sendToRoom(data.roomId, {
        event: 'user_joined',
        data: { userId: ws.data.userId }
    });
};