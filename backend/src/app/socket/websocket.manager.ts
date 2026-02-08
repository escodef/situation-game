import type { ServerWebSocket } from 'bun';
import { ISocketData, TSocketOutcomeMessage } from 'src/shared';

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
    }

    public handleDisconnect(userId: string): void {
        this.users.delete(userId);
        console.debug(`User ${userId} disconnected.`);
    }

    public joinGame(ws: ServerWebSocket<ISocketData>, gameId: string): void {
        ws.subscribe(gameId);
    }

    public leaveGame(ws: ServerWebSocket<ISocketData>, gameId: string): void {
        ws.unsubscribe(gameId);
    }

    public sendToUser(userId: string, message: TSocketOutcomeMessage): void {
        const ws = this.users.get(userId);
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    }

    public sendToGame(
        ws: ServerWebSocket<ISocketData>,
        gameId: string,
        message: TSocketOutcomeMessage,
        includeSelf: boolean = false,
    ): void {
        const msgString = JSON.stringify(message);
        ws.publish(gameId, msgString);

        if (includeSelf) {
            ws.send(msgString);
        }
    }
}

export const websocketInstance = WebsocketManager.getInstance();
