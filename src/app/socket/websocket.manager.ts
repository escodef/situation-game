import { ServerWebSocket } from 'bun';
import { SocketData, SocketMessage } from './interfaces/message.interfaces';

interface ActiveUser {
    userId: number;
    ws: ServerWebSocket<SocketData>;
}

export class WebsocketManager {
    private static instance: WebsocketManager;

    private readonly users: Map<number, ActiveUser> = new Map();
    private readonly rooms: Map<string, Set<number>> = new Map();

    constructor() {}

    public static getInstance(): WebsocketManager {
        if (!WebsocketManager.instance) {
            WebsocketManager.instance = new WebsocketManager();
        }
        return WebsocketManager.instance;
    }

    public handleConnect(
        ws: ServerWebSocket<SocketData>,
        userId: number
    ): void {
        const activeUser: ActiveUser = { userId, ws };
        this.users.set(userId, activeUser);
        console.log(`User ${userId} connected.`);
    }

    public handleDisconnect(userId: number): void {
        if (this.users.has(userId)) {
            this.users.delete(userId);
            this.rooms.forEach((userIds, roomId) => {
                if (userIds.has(userId)) {
                    userIds.delete(userId);
                    if (userIds.size === 0) {
                        this.rooms.delete(roomId);
                    }
                }
            });
            console.log(`User ${userId} disconnected. Rooms cleaned.`);
        }
    }

    public joinRoom(userId: number, roomId: string): void {
        if (!this.users.has(userId)) return;

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        this.rooms.get(roomId)!.add(userId);
    }

    public leaveRoom(userId: number, roomId: string): void {
        const userIds = this.rooms.get(roomId);
        if (userIds) {
            userIds.delete(userId);
            if (userIds.size === 0) {
                this.rooms.delete(roomId);
            }
        }
    }

    public getRoomUserCount(roomId: string): number {
        return this.rooms.get(roomId)?.size || 0;
    }

    public sendToUser(userId: number, message: SocketMessage): void {
        const user = this.users.get(userId);
        if (user) {
            user.ws.send(JSON.stringify(message));
        }
    }

    public sendToRoom(
        roomId: string,
        message: SocketMessage,
        excludeUserId?: number
    ): void {
        const userIds = this.rooms.get(roomId);
        if (userIds) {
            const messageString = JSON.stringify(message);
            userIds.forEach((userId) => {
                if (userId !== excludeUserId) {
                    const user = this.users.get(userId);
                    if (user) {
                        user.ws.send(messageString);
                    }
                }
            });
        }
    }

    public broadcast(message: SocketMessage, excludeUserId?: number): void {
        const messageString = JSON.stringify(message);
        this.users.forEach((user) => {
            if (user.userId !== excludeUserId) {
                user.ws.send(messageString);
            }
        });
    }
}

export const websocketInstance = new WebsocketManager();
