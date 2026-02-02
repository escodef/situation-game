import type { ServerWebSocket } from 'bun';
import { ESocketIncomeEvent, ESocketOutcomeEvent } from 'src/shared/enums';

export interface ISocketIncomeMessage<T = unknown> {
    event: ESocketIncomeEvent;
    data: T;
}

export interface ISocketData {
    userId: string;
    token: string;
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

export type TSocketProcessor<T = any> = (
    ws: ServerWebSocket<ISocketData>,
    data: T,
) => void | Promise<void>;
