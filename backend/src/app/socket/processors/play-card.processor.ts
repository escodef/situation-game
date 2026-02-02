import type { ServerWebSocket } from 'bun';
import type { ISocketData } from '../types';

export const processPlayCard = async (ws: ServerWebSocket<ISocketData>, data: any) => {
    console.log(`User ${ws.data.userId} played a card`);
};
