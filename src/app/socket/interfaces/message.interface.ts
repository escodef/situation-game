import { ServerWebSocket } from 'bun';

enum Events {
    JOIN_ROOM = 'join_room',
    PLAY_CARD = 'play_card',
}
export interface SocketData {
    userId: number;
    token: string;
}

export interface SocketMessage<T = any> {
    event: Events;
    data: T;
}

export type SocketProcessor<T = any> = (
    ws: ServerWebSocket<SocketData>,
    data: T,
) => void | Promise<void>;
