import type { ServerWebSocket } from 'bun';
import { ESocketIncomeEvent } from 'src/shared/enums';
import { processJoinGame } from './processors';
import { ISocketData, ISocketIncomeMessage } from './types';

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
                    event: 'error',
                    data: 'No event name provided',
                }),
            );
            return;
        }

        console.debug(`Event received: ${message.event} from User ${ws.data.userId}`);

        switch (message.event) {
            case ESocketIncomeEvent.JOIN_ROOM:
                await processJoinGame(ws, message.data);
                break;

            default:
                ws.send(JSON.stringify({ event: 'error', data: 'Unknown event' }));
        }
    } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ event: 'error', data: 'Invalid message format' }));
    }
};
