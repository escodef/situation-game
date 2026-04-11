import { t } from 'elysia';
import { ESocketIncomeEvent } from 'shared/enums';

export const SocketQuerySchema = t.Object({
    token: t.String(),
});

export const JoinGameProcessorSchema = t.Object({ gameId: t.String() });
export const LeaveGameProcessorSchema = t.Undefined();
export const PickCardProcessorSchema = t.Object({ cardId: t.String(), roundId: t.String() });
export const StartGameProcessorSchema = t.Undefined();
export const VoteProcessorSchema = t.Object({ targetUserId: t.String() });

export const SocketBodySchema = t.Union([
    t.Object({ event: t.Literal(ESocketIncomeEvent.JOIN_GAME), data: JoinGameProcessorSchema }),
    t.Object({ event: t.Literal(ESocketIncomeEvent.LEAVE_GAME), data: LeaveGameProcessorSchema }),
    t.Object({ event: t.Literal(ESocketIncomeEvent.PICK_CARD), data: PickCardProcessorSchema }),
    t.Object({ event: t.Literal(ESocketIncomeEvent.START_GAME), data: StartGameProcessorSchema }),
    t.Object({ event: t.Literal(ESocketIncomeEvent.VOTE), data: VoteProcessorSchema }),
]);
