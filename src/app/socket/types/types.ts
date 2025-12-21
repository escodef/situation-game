import { ServerWebSocket } from 'bun';

// NOTE: если будет дохуя типов нужно будет разделить

export enum ESocketIncomeEvent {
    JOIN_ROOM = 'join_room',
    PLAY_CARD = 'play_card',
}

export enum ESocketOutcomeEvent {
    JOINED_TO_ROOM = 'joined_room',
}

export interface ISocketIncomeMessage<T = unknown> {
    event: ESocketIncomeEvent;
    data: T;
}

export type TSocketOutcomeMessage<T = unknown> =
    | {
          event: ESocketOutcomeEvent;
          data: T;
      }
    | {
          event: ESocketOutcomeEvent;
          errors: string[];
      };

export interface ISocketData {
    userId: number;
    token: string;
}

export type TSocketProcessor<T = any> = (
    ws: ServerWebSocket<ISocketData>,
    data: T
) => void | Promise<void>;
