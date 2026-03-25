import type { ElysiaWS } from 'elysia/ws';
import { db } from 'src/database/data-source';
import { GameRoundRepo, PlayerHandRepo, PlayerMoveRepo, UserRepo } from 'src/database/repositories';
import { ERoundStatus, ESocketOutcomeEvent, type TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processPickCard: TSocketProcessor<{ cardId: string; roundId: string }> = async (
    ws: ElysiaWS<any, any>,
    data: { cardId: string; roundId: string },
) => {
    const { userId } = ws.data;
    const { cardId, roundId } = data;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const round = await GameRoundRepo.findById(roundId, client);
        if (!round || round.status !== ERoundStatus.PICKING) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Сейчас нельзя выбирать карты',
                }),
            );
            return;
        }

        const alreadyMoved = await PlayerMoveRepo.hasUserMoved(roundId, userId, client);
        if (alreadyMoved) {
            ws.send(
                JSON.stringify({ event: ESocketOutcomeEvent.ERROR, data: 'Вы уже сделали ход' }),
            );
            return;
        }

        const cardTaken = await PlayerHandRepo.takeCardFromHand(
            userId,
            cardId,
            round.gameId,
            client,
        );

        if (!cardTaken) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Этой карты нет в вашей руке',
                }),
            );
            return;
        }

        await PlayerMoveRepo.makeMove(roundId, userId, cardId, client);

        const playersCount = await UserRepo.countPlayersInGame(round.gameId, client);
        const movesCount = await PlayerMoveRepo.countMovesInRound(roundId, client);

        websocketInstance.sendToGame(
            ws,
            round.gameId,
            {
                event: ESocketOutcomeEvent.CARD_PICKED,
                data: { userId, cardId },
            },
            true,
        );

        if (movesCount >= playersCount) {
            await GameRoundRepo.updateStatus(roundId, ERoundStatus.SHOWING, client);

            websocketInstance.sendToGame(
                ws,
                round.gameId,
                {
                    event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                    data: {
                        status: ERoundStatus.SHOWING,
                        moves: await PlayerMoveRepo.getMovesWithCards(roundId, client),
                    },
                },
                true,
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('processPickCard() error:', error);
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
