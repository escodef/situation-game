import {
    GameRepo,
    GameRoundRepo,
    PlayerHandRepo,
    PlayerMoveRepo,
    UserRepo,
} from 'database/repositories';
import {
    EGameStatus,
    ERoundStatus,
    ESocketOutcomeEvent,
    type IPlayerMove,
    type TElysiaWS,
    type TSocketOutcomeMessage,
} from 'shared';

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
        const user = await UserRepo.findById(userId);

        if (user?.gameId) {
            ws.subscribe(user.gameId);

            const game = await GameRepo.findOne(user.gameId);
            const currentRound = await GameRoundRepo.findCurrentRound(user.gameId);
            const hand = await PlayerHandRepo.getHand(userId, user.gameId);

            let moves: IPlayerMove[] = [];
            if (
                currentRound &&
                [ERoundStatus.SHOWING, ERoundStatus.VOTING].includes(currentRound.status)
            ) {
                moves = await PlayerMoveRepo.getMovesWithCards(currentRound.id);
            }

            this.sendToUser(userId, {
                event: ESocketOutcomeEvent.GAME_STATE,
                data: {
                    game: game,
                    currentRound: currentRound,
                    hand: hand,
                    moves: moves,
                },
            });
        }
    }

    public async handleDisconnect(userId: string) {
        this.users.delete(userId);
        const user = await UserRepo.findWithGame(userId);

        setTimeout(async () => {
            if (this.users.has(userId)) return;

            if (user?.gameId) {
                await UserRepo.leaveGame(userId);

                const playersCount = await UserRepo.countPlayersInGame(user.gameId);

                this.sendToGameRoom(user.gameId, {
                    event: ESocketOutcomeEvent.PLAYER_LEFT,
                    data: { userId },
                });

                if (playersCount < 2 && user.game?.status === EGameStatus.STARTED) {
                    await GameRepo.updateStatus(user.gameId, EGameStatus.FINISHED);
                    await PlayerHandRepo.clearAllGameData(user.gameId);

                    this.sendToGameRoom(user.gameId, {
                        event: ESocketOutcomeEvent.ERROR,
                        data: 'Игроки покинули игру. Игра завершена досрочно.',
                    });
                }
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
