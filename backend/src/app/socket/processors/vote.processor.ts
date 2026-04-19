import { db, GameRoundRepo, UserRepo, VoteRepo } from 'database';
import { gameQueue } from 'queue';
import { GameLoopService } from 'services';
import {
    ERoundStatus,
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TSocketProcessor,
    type TVotePayload,
} from 'shared';
import { sendToGame } from '../websocket.manager';

export const processVote: TSocketProcessor<TVotePayload> = async (ws: TElysiaWS, data) => {
    const { userId } = ws.data;
    const { targetUserId } = data;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const user = await UserRepo.findById(userId, client);

        if (!user?.gameId) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Вы не являетесь участником этой игры',
                }),
            );
            return;
        }

        const gameId = user.gameId;

        const curRound = await GameRoundRepo.findCurrentRound(gameId, client);

        if (!curRound || curRound.status !== ERoundStatus.VOTING) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Голосование сейчас недоступно',
                }),
            );
            return;
        }

        const existingVotes = await VoteRepo.findByRound(curRound.id, client);
        if (existingVotes.some((v) => v.voterId === userId)) {
            ws.send(
                JSON.stringify({ event: ESocketOutcomeEvent.ERROR, data: 'Вы уже проголосовали' }),
            );
            return;
        }

        const vote = await VoteRepo.create(curRound.id, userId, targetUserId, client);

        existingVotes.push(vote);

        sendToGame(ws, gameId, {
            event: ESocketOutcomeEvent.PLAYER_VOTED,
            data: {
                voterId: vote.voterId,
            },
        });

        const playersCount = await UserRepo.countPlayersInGame(gameId, client);

        if (existingVotes.length >= playersCount) {
            const job = await gameQueue.getJob(`voting:${curRound.id}`);
            if (job) await job.remove();

            await GameLoopService.finishVoting(gameId, curRound.id);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('processVote() error:', error);
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка сервера при голосовании',
            }),
        );
    } finally {
        client.release();
    }
};
