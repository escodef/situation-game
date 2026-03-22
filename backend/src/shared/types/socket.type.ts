import { ElysiaWS } from 'elysia/ws';
import { ESocketOutcomeEvent } from '../enums';

export type TSocketOutcomeMessage<T = unknown> =
    | {
          event: ESocketOutcomeEvent;
          data: T;
      }
    | {
          event: ESocketOutcomeEvent;
          errors: string[];
      };

export type TSocketProcessor<T = any> = (ws: ElysiaWS<any, any>, data: T) => void | Promise<void>;
