import { ERoundStatus } from '../enums/round-status.enum';
import { ISituation } from './situation.interface';

export interface IGameRound {
    id: string;
    gameId: string;
    roundNumber: number;
    situationId: string;
    status: ERoundStatus;
    endsAt: Date;
    situation?: Partial<ISituation>;
}
