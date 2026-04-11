import {
    ESocketIncomeEvent,
    ESocketOutcomeEvent,
    type TElysiaWS,
    type TSocketIncomeMessage,
} from 'shared';
import {
    processJoinGame,
    processLeaveGame,
    processPickCard,
    processStartGame,
    processVote,
} from './processors';

export const handleMessage = async (ws: TElysiaWS, message: TSocketIncomeMessage) => {
    try {
        if (!message.event) {
            ws.send({ event: ESocketOutcomeEvent.ERROR, data: 'No event name' });
            return;
        }

        console.debug(`Event received: ${message.event} from User ${ws.data.userId}`);

        switch (message.event) {
            case ESocketIncomeEvent.JOIN_GAME:
                await processJoinGame(ws, message.data);
                break;
            case ESocketIncomeEvent.START_GAME:
                await processStartGame(ws, message.data);
                break;
            case ESocketIncomeEvent.PICK_CARD:
                await processPickCard(ws, message.data);
                break;
            case ESocketIncomeEvent.VOTE:
                await processVote(ws, message.data);
                break;
            case ESocketIncomeEvent.LEAVE_GAME:
                await processLeaveGame(ws, message.data);
                break;
            default:
                ws.send(
                    JSON.stringify({ event: ESocketOutcomeEvent.ERROR, data: 'Unknown event' }),
                );
        }
    } catch (error) {
        console.error('Error handling message:', error);
        ws.send(
            JSON.stringify({ event: ESocketOutcomeEvent.ERROR, data: 'Invalid message format' }),
        );
    }
};
