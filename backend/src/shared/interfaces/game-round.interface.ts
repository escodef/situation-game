import { ERoundStatus } from '../enums/round-status.enum';
import { ISituation } from './situation.interface';
import { IUser } from './user.interface';

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
