import type { ERoundStatus } from '../enums/round-status.enum';
import type { ISituation } from './situation.interface';
import type { IUser } from './user.interface';

export interface IGameRound {
    id: string;
    gameId: string;
    roundNumber: number;
    situationId: string;
    status: ERoundStatus;
    endsAt: Date;
    remainingMs: number;
    situation?: Partial<ISituation>;
    users?: Partial<IUser>[];
}
