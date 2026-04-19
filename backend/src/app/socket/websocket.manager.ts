import {
    GameRepo,
    GameRoundRepo,
    PlayerHandRepo,
    PlayerMoveRepo,
    UserRepo,
    valkeyConnection,
    valkeySubscriber,
} from 'database';
import type { Server } from 'elysia/universal';
import {
    EGameStatus,
    ERoundStatus,
    ESocketOutcomeEvent,
    type IPlayerMove,
    type TElysiaWS,
    type TSocketOutcomeMessage,
} from 'shared';

const users: Map<string, TElysiaWS> = new Map();
let appServer: Server | null = null;

const CHANNEL_NAME = 'game-ws-events';

export const initWebsocketManager = (server: Server) => {
    appServer = server;

    valkeySubscriber.subscribe(CHANNEL_NAME, (err) => {
        if (err) console.error('Не удалось подписаться на канал:', err);
        else console.log(`Начато прослушивание канала: ${CHANNEL_NAME}`);
    });

    valkeySubscriber.on('message', (channel, messageStr) => {
        if (channel !== CHANNEL_NAME) return;

        try {
            const { type, targetId, senderId, includeSelf, message } = JSON.parse(messageStr);
            const payload = JSON.stringify(message);

            if (type === 'user') {
                const ws = users.get(targetId);
                if (ws) ws.send(payload);
            } else if (type === 'room') {
                if (includeSelf) {
                    appServer?.publish(targetId, payload);
                } else {
                    const senderWs = users.get(senderId);
                    if (senderWs) {
                        senderWs.publish(targetId, payload);
                    } else {
                        appServer?.publish(targetId, payload);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибки при парсинге сообщения из Valkey:', error);
        }
    });
};

export const handleConnect = async (ws: TElysiaWS) => {
    const userId = ws.data.userId;

    const existingWs = users.get(userId);
    if (existingWs) {
        existingWs.close(4000, 'Обнаружен логин с другого устройства');
    }

    users.set(userId, ws);
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

        sendToUser(userId, {
            event: ESocketOutcomeEvent.GAME_STATE,
            data: {
                game: game,
                currentRound: currentRound,
                hand: hand,
                moves: moves,
            },
        });
    }
};

export const handleDisconnect = async (userId: string) => {
    users.delete(userId);
    const user = await UserRepo.findWithGame(userId);

    setTimeout(async () => {
        if (users.has(userId)) return;

        if (user?.gameId) {
            await UserRepo.leaveGame(userId);

            const playersCount = await UserRepo.countPlayersInGame(user.gameId);

            sendToGameRoom(user.gameId, {
                event: ESocketOutcomeEvent.PLAYER_LEFT,
                data: { userId },
            });

            if (playersCount < 2 && user.game?.status === EGameStatus.STARTED) {
                await GameRepo.updateStatus(user.gameId, EGameStatus.FINISHED);
                await PlayerHandRepo.clearAllGameData(user.gameId);

                sendToGameRoom(user.gameId, {
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Игроки покинули игру. Игра завершена досрочно.',
                });
            }
        }
    }, 30000);
};

export const joinGame = (ws: TElysiaWS, gameId: string) => {
    ws.subscribe(gameId);
};

export const leaveGame = (ws: TElysiaWS, gameId: string) => {
    ws.unsubscribe(gameId);
};

export const sendToUser = (userId: string, message: TSocketOutcomeMessage): void => {
    valkeyConnection.publish(
        CHANNEL_NAME,
        JSON.stringify({
            type: 'user',
            targetId: userId,
            message,
        }),
    );
};

export const sendToGameRoom = (gameId: string, message: TSocketOutcomeMessage): void => {
    valkeyConnection.publish(
        CHANNEL_NAME,
        JSON.stringify({
            type: 'room',
            targetId: gameId,
            includeSelf: true,
            message,
        }),
    );
};

export const sendToGame = (
    ws: TElysiaWS,
    gameId: string,
    message: TSocketOutcomeMessage,
    includeSelf: boolean = false,
): void => {
    valkeyConnection.publish(
        CHANNEL_NAME,
        JSON.stringify({
            type: 'room',
            targetId: gameId,
            senderId: ws.data.userId,
            includeSelf,
            message,
        }),
    );
};
