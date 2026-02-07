import { ServerWebSocket } from 'bun';
import { ESocketOutcomeEvent } from '../enums';
import { ISocketData } from '../interfaces/socket.interface';

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
