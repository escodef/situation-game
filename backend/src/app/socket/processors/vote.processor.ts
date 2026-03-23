import { inspect } from 'bun';
import type { ElysiaWS } from 'elysia/ws';
import { db } from 'src/database/data-source';
import { GameRoundRepo, UserRepo, VoteRepo } from 'src/database/repositories';
import { ERoundStatus, ESocketOutcomeEvent, type TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processVote: TSocketProcessor<{ targetUserId: string }> = async (
    ws: ElysiaWS<any, any>,
    data: { targetUserId: string },
) => {
    const { userId } = ws.data;
    const { targetUserId } = data;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const user = await UserRepo.findById(userId, client);

        if (!user || !user.gameId) {
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

        if (!curRound || !curRound.users?.length) {
            throw new Error();
        }

        const vote = await VoteRepo.create(curRound.id, userId, targetUserId, client);

        const curRoundVotes = await VoteRepo.findByRound(curRound.id);

        websocketInstance.sendToGame(ws, gameId, {
            event: ESocketOutcomeEvent.PLAYER_VOTED,
            data: {
                voterId: vote.voterId,
                targetUserId: vote.targetUserId,
            },
        });

        await GameRoundRepo.updateStatus(curRound.id, ERoundStatus.SHOWING, client);

        if (curRound.users.length <= curRoundVotes.length) {
            websocketInstance.sendToGame(ws, gameId, {
                event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                data: {
                    voterId: vote.voterId,
                    targetUserId: vote.targetUserId,
                },
            });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(inspect(error));
        ws.send(
            JSON.stringify({
                event: ESocketOutcomeEvent.ERROR,
                data: 'Ошибка сервера при выборе карты',
            }),
        );
    } finally {
        client.release();
    }
};
