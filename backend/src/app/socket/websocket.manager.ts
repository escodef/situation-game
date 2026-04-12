import { UserRepo } from 'database/repositories';
import { ESocketOutcomeEvent, type TElysiaWS, type TSocketOutcomeMessage } from 'shared';

export class WebsocketManager {
    private static instance: WebsocketManager;

    private readonly users: Map<string, TElysiaWS> = new Map();

    public static getInstance(): WebsocketManager {
        if (!WebsocketManager.instance) {
            WebsocketManager.instance = new WebsocketManager();
        }
        return WebsocketManager.instance;
    }

    public async handleConnect(ws: TElysiaWS) {
        const userId = ws.data.userId;

        const existingWs = this.users.get(userId);
        if (existingWs) {
            existingWs.close(4000, 'Logged in from another device');
        }

        this.users.set(userId, ws);
        console.debug(`User ${userId} connected.`);

        const user = await UserRepo.findById(userId);

        if (user?.gameId) {
            ws.subscribe(user.gameId);

            this.sendToUser(userId, {
                event: ESocketOutcomeEvent.PLAYER_RECONNECTED,
                data: { gameId: user.gameId },
            });
        }
    }

    public async handleDisconnect(userId: string) {
        this.users.delete(userId);
        console.debug(`User ${userId} disconnected.`);
        const user = await UserRepo.findWithGame(userId);

        setTimeout(async () => {
            if (this.users.has(userId)) return;

            if (user?.game) {
                await UserRepo.leaveGame(userId);
            }
        }, 30000);
    }

    public joinGame(ws: TElysiaWS, gameId: string): void {
        ws.subscribe(gameId);
    }

    public leaveGame(ws: TElysiaWS, gameId: string): void {
        ws.unsubscribe(gameId);
    }

    public sendToUser(userId: string, message: TSocketOutcomeMessage): void {
        const ws = this.users.get(userId);
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    }

    public sendToGameRoom(gameId: string, message: TSocketOutcomeMessage): void {
        const msg = JSON.stringify(message);
        const firstWs = Array.from(this.users.values())[0];
        if (firstWs) {
            firstWs.publish(gameId, msg);
        }
    }

    public sendToGame(
        ws: TElysiaWS,
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
