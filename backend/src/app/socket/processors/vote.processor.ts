import { ServerWebSocket } from 'bun';
import { GameRoundRepo, UserRepo, VoteRepo } from 'src/database/repositories';
import { ESocketOutcomeEvent, ISocketData, TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processVote: TSocketProcessor<{ targetUserId: string }> = async (
    ws: ServerWebSocket<ISocketData>,
    data: { targetUserId: string },
) => {
    const { userId } = ws.data;
    const { targetUserId } = data;

    const user = await UserRepo.findById(userId);

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

    const curRound = await GameRoundRepo.findCurrentRound(gameId);

    const vote = await VoteRepo.create(curRound.id, userId, targetUserId);

    websocketInstance.sendToGame(ws, gameId, {
        event: ESocketOutcomeEvent.PLAYER_VOTED,
        data: {
            voterId: vote.voterId,
            targetUserId: vote.targetUserId,
        },
    });

    console.debug(`User ${user.nickname} joined socket in game ${gameId}`);
};
