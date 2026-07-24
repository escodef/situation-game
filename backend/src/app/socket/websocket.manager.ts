import { randomUUID } from 'bullmq';
import {
    GameRepo,
    GameRoundRepo,
    PlayerHandRepo,
    PlayerMoveRepo,
    UserRepo,
    VoteRepo,
    valkeyConnection,
    valkeySubscriber,
} from 'database';
import type { Server } from 'elysia/universal';
import { gameQueue } from 'queue';
import { GameLoopService } from 'services';
import {
    EGameStatus,
    ERoundStatus,
    ESocketOutcomeEvent,
    type IPlayerMove,
    type TElysiaWS,
    type TSocketOutcomeMessage,
} from 'shared';

const INSTANCE_ID = randomUUID();
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
            const { type, targetId, senderId, senderInstanceId, includeSelf, message } =
                JSON.parse(messageStr);
            const payload = JSON.stringify(message);

            if (type === 'user') {
                const ws = users.get(targetId);
                if (ws) ws.send(payload);
            } else if (type === 'room') {
                if (includeSelf) {
                    appServer?.publish(targetId, payload);
                } else {
                    if (senderInstanceId === INSTANCE_ID) {
                        const senderWs = users.get(senderId);
                        if (senderWs) {
                            senderWs.publish(targetId, payload);
                        } else {
                            appServer?.publish(targetId, payload);
                        }
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

    await valkeyConnection.set(`presence:${userId}`, 'online');

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

    await valkeyConnection.set(`presence:${userId}`, 'offline', 'EX', 30);

    setTimeout(async () => {
        const presence = await valkeyConnection.get(`presence:${userId}`);
        if (presence === 'online') return;

        const user = await UserRepo.findWithGame(userId);

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
            } else if (user.game?.status === EGameStatus.STARTED) {
                const round = await GameRoundRepo.findCurrentRound(user.gameId);
                if (round && round.status === ERoundStatus.PICKING) {
                    const movesCount = await PlayerMoveRepo.countMovesInRound(round.id);
                    if (movesCount >= playersCount) {
                        const job = await gameQueue.getJob(`picking:${round.id}`);
                        if (job) await job.remove();
                        await GameLoopService.finishPicking(user.gameId, round.id);
                    }
                } else if (round && round.status === ERoundStatus.VOTING) {
                    const votes = await VoteRepo.findByRound(round.id);
                    if (votes.length >= playersCount) {
                        const job = await gameQueue.getJob(`voting:${round.id}`);
                        if (job) await job.remove();
                        await GameLoopService.finishVoting(user.gameId, round.id);
                    }
                }
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
            senderInstanceId: INSTANCE_ID,
            includeSelf,
            message,
        }),
    );
};
