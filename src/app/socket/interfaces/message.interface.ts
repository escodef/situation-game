import { ServerWebSocket } from 'bun';

export interface SocketData {
    userId: number;
    token: string;
}

export interface SocketMessage<T = any> {
    event: string;
    data: T;
}

export type SocketProcessor<T = any> = (
    ws: ServerWebSocket<SocketData>,
    data: T,
) => void | Promise<void>;
