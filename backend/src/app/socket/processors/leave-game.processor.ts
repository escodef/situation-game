import {
    db,
    GameRepo,
    GameRoundRepo,
    PlayerHandRepo,
    PlayerMoveRepo,
    UserRepo,
    VoteRepo,
} from 'database';
import { gameQueue } from 'queue';
import { GameLoopService } from 'services';
import {
    EGameStatus,
    ERoundStatus,
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TLeaveGamePayload,
    type TSocketProcessor,
} from 'shared';
import { sendToGame } from '../websocket.manager';

export const processLeaveGame: TSocketProcessor<TLeaveGamePayload> = async (ws: TElysiaWS) => {
    const { userId } = ws.data;
    const client = await db.connect();

    let triggerFinishPickingRoundId: string | null = null;
    let triggerFinishVotingRoundId: string | null = null;
    let currentGameId: string | null = null;

    try {
        await client.query('BEGIN');

        const user = await UserRepo.findWithGame(userId, client);

        if (!user?.gameId) {
            throw new Error('Пользователь не в игре');
        }

        currentGameId = user.gameId;

        await UserRepo.leaveGame(userId, client);

        const playersCount = await UserRepo.countPlayersInGame(user.gameId, client);
        if (playersCount < 2 && user.game?.status === EGameStatus.STARTED) {
            await GameRepo.updateStatus(user.gameId, EGameStatus.FINISHED, client);
            await PlayerHandRepo.clearAllGameData(user.gameId, client);
            sendToGame(
                ws,
                user.gameId,
                { event: ESocketOutcomeEvent.ERROR, data: 'Игроки покинули игру. Игра завершена.' },
                true,
            );
        } else if (user.game?.status === EGameStatus.STARTED) {
            const round = await GameRoundRepo.findCurrentRound(user.gameId, client);
            if (round?.status === ERoundStatus.PICKING) {
                const movesCount = await PlayerMoveRepo.countMovesInRound(round.id, client);
                if (movesCount >= playersCount) {
                    triggerFinishPickingRoundId = round.id;
                }
            } else if (round?.status === ERoundStatus.VOTING) {
                const votes = await VoteRepo.findByRound(round.id, client);
                if (votes.length >= playersCount) {
                    triggerFinishVotingRoundId = round.id;
                }
            }
        }

        sendToGame(
            ws,
            user.gameId,
            {
                event: ESocketOutcomeEvent.PLAYER_LEFT,
                data: { userId },
            },
            true,
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('processLeaveGame() error:', error);
        ws.send({
            event: ESocketOutcomeEvent.ERROR,
            data: 'Ошибка сервера при выходе из игры',
        });
    } finally {
        client.release();
    }

    if (currentGameId && triggerFinishPickingRoundId) {
        const job = await gameQueue.getJob(`picking:${triggerFinishPickingRoundId}`);
        if (job) await job.remove();
        await GameLoopService.finishPicking(currentGameId, triggerFinishPickingRoundId);
    } else if (currentGameId && triggerFinishVotingRoundId) {
        const job = await gameQueue.getJob(`voting:${triggerFinishVotingRoundId}`);
        if (job) await job.remove();
        await GameLoopService.finishVoting(currentGameId, triggerFinishVotingRoundId);
    }
};
