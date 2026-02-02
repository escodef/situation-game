import type { ServerWebSocket } from 'bun';
import type { ISocketData, TSocketOutcomeMessage } from './types';

export class WebsocketManager {
    private static instance: WebsocketManager;

    private readonly users: Map<string, ServerWebSocket<ISocketData>> = new Map();

    public static getInstance(): WebsocketManager {
        if (!WebsocketManager.instance) {
            WebsocketManager.instance = new WebsocketManager();
        }
        return WebsocketManager.instance;
    }

    public handleConnect(ws: ServerWebSocket<ISocketData>): void {
        const userId = ws.data.userId;

        const existingWs = this.users.get(userId);
        if (existingWs) {
            existingWs.close(4000, 'Logged in from another device');
        }

        this.users.set(userId, ws);
        console.debug(`User ${userId} connected.`);
        ws.subscribe('global');
    }

    public handleDisconnect(userId: string): void {
        this.users.delete(String(userId));
        console.debug(`User ${userId} disconnected.`);
    }

    public joinRoom(ws: ServerWebSocket<ISocketData>, gameId: string): void {
        ws.subscribe(gameId);
    }

    public leaveRoom(ws: ServerWebSocket<ISocketData>, gameId: string): void {
        ws.unsubscribe(gameId);
    }

    public sendToUser(userId: string, message: TSocketOutcomeMessage): void {
        const ws = this.users.get(String(userId));
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    }

    public sendToRoom(
        ws: ServerWebSocket<ISocketData>,
        roomId: string,
        message: TSocketOutcomeMessage,
    ): void {
        ws.publish(roomId, JSON.stringify(message));
    }

    public broadcast(ws: ServerWebSocket<ISocketData>, message: TSocketOutcomeMessage): void {
        const messageString = JSON.stringify(message);
        ws.publish('global', messageString);
    }
}

export const websocketInstance = WebsocketManager.getInstance();
