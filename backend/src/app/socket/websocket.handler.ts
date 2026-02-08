import type { ServerWebSocket } from 'bun';
import {
    ESocketIncomeEvent,
    ESocketOutcomeEvent,
    ISocketData,
    ISocketIncomeMessage,
} from 'src/shared';
import { processJoinGame, processPickCard, processStartGame } from './processors';

export const handleMessage = async (
    ws: ServerWebSocket<ISocketData>,
    messageString: string | Buffer,
) => {
    try {
        const str = typeof messageString === 'string' ? messageString : messageString.toString();

        const message: ISocketIncomeMessage<any> = JSON.parse(str);
        if (!message.event) {
            ws.send(
                JSON.stringify({
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'No event name provided',
                }),
            );
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
                break;
            default:
                ws.send(JSON.stringify({ event: 'error', data: 'Unknown event' }));
        }
    } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ event: 'error', data: 'Invalid message format' }));
    }
};
