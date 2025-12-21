import { ServerWebSocket } from 'bun';
import { SocketData, SocketMessage } from './interfaces/message.interface';
import { processJoinRoom, processPlayCard } from './processors';

export const handleMessage = async (
    ws: ServerWebSocket<SocketData>, 
    messageString: string | Buffer
) => {
    try {
        const str = typeof messageString === 'string' ? messageString : messageString.toString();
        const message: SocketMessage = JSON.parse(str);

        if (!message.event) {
            ws.send(JSON.stringify({ event: 'error', data: 'No event name provided' }));
            return;
        }

        console.debug(`Event received: ${message.event} from User ${ws.data.userId}`);

        switch (message.event) {
            case 'join_room':
                await processJoinRoom(ws, message.data); 
                break;
            
            case 'play_card':
                await processPlayCard(ws, message.data);
                break;

            default:
                ws.send(JSON.stringify({ event: 'error', data: 'Unknown event' }));
        }

    } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ event: 'error', data: 'Invalid message format' }));
    }
};