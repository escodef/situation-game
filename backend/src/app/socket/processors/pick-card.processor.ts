import { ServerWebSocket } from 'bun';
import { db } from 'src/database/data-source';
import { CardPackRepo, GameRoundRepo, UserRepo } from 'src/database/repositories';
import { ERoundStatus, ESocketOutcomeEvent, ISocketData, TSocketProcessor } from 'src/shared';
import { websocketInstance } from '../websocket.manager';

export const processPickCard: TSocketProcessor<{ cardId: string; roundId: string }> = async (
    ws: ServerWebSocket<ISocketData>,
    data: { cardId: string; roundId: string },
) => {
    const { userId } = ws.data;
    const { cardId, roundId } = data;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const round = await GameRoundRepo.findById(roundId, client);
        if (!round || round.status !== ERoundStatus.PICKING) {
            ws.send(JSON.stringify({ event: 'error', data: 'Сейчас нельзя выбирать карты' }));
            return;
        }

        const alreadyMoved = await GameRoundRepo.hasUserMoved(roundId, userId, client);
        if (alreadyMoved) {
            ws.send(JSON.stringify({ event: 'error', data: 'Вы уже сделали ход' }));
            return;
        }

        const cardTaken = await CardPackRepo.takeCardFromHand(userId, cardId, round.gameId, client);
        if (!cardTaken) {
            ws.send(JSON.stringify({ event: 'error', data: 'Этой карты нет в вашей руке' }));
            return;
        }

        await GameRoundRepo.makeMove(roundId, userId, cardId, client);

        const playersCount = await UserRepo.countPlayersInGame(round.gameId, client);
        const movesCount = await GameRoundRepo.countMovesInRound(roundId, client);

        if (movesCount >= playersCount) {
            await GameRoundRepo.updateStatus(roundId, ERoundStatus.SHOWING, client);

            websocketInstance.sendToGame(
                ws,
                round.gameId,
                {
                    event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                    data: {
                        status: ERoundStatus.SHOWING,
                        moves: await GameRoundRepo.getMovesWithCards(roundId, client),
                    },
                },
                true,
            );
        } else {
            websocketInstance.sendToGame(
                ws,
                round.gameId,
                {
                    event: ESocketOutcomeEvent.CARD_PICKED,
                    data: { userId },
                },
                true,
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('PickCard Error:', error);
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
