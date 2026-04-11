import type { Context, RouteSchema, Static } from 'elysia';
import type { ElysiaWS } from 'elysia/ws';
import type {
    JoinGameProcessorSchema,
    LeaveGameProcessorSchema,
    PickCardProcessorSchema,
    SocketBodySchema,
    SocketQuerySchema,
    StartGameProcessorSchema,
    VoteProcessorSchema,
} from 'shared/schemas';
import type { ESocketOutcomeEvent } from '../enums';

export type TSocketOutcomeMessage<T = unknown> =
    | {
          event: ESocketOutcomeEvent;
          data: T;
      }
    | {
          event: ESocketOutcomeEvent;
          errors: string[];
      };

export type TSocketIncomeMessage = Static<typeof SocketBodySchema>;

export type TSocketQuery = Static<typeof SocketQuerySchema>;

export type TJoinGamePayload = Static<typeof JoinGameProcessorSchema>;
export type TLeaveGamePayload = Static<typeof LeaveGameProcessorSchema>;
export type TPickCardPayload = Static<typeof PickCardProcessorSchema>;
export type TStartGamePayload = Static<typeof StartGameProcessorSchema>;
export type TVotePayload = Static<typeof VoteProcessorSchema>;

export type TWSContext = Context & {
    query: TSocketQuery;
    userId: string;
};

export type TWSRoute = RouteSchema & {
    body: TSocketIncomeMessage;
    query: TSocketQuery;
};

export type TElysiaWS = ElysiaWS<TWSContext, TWSRoute>;

export type TSocketProcessor<T> = (ws: TElysiaWS, data: T) => void | Promise<void>;
