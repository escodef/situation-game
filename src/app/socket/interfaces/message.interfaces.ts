import { ServerWebSocket } from 'bun';

export interface SocketData {
    userId: number;
    email: string;
    token: string;
}

export interface SocketMessage<T = unknown> {
    event: string;
    data: T;
}

export type SocketProcessor<T = any> = (
    ws: ServerWebSocket<SocketData>,
    data: T
) => void | Promise<void>;
