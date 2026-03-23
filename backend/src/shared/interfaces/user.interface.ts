import type { EUserRole } from '../enums/role.enum';
import type { IGame } from './game.interface';
import type { IPlayerHand } from './player-hand.interface';
import type { ISession } from './session.interface';
import type { IVote } from './vote.interface';

export interface IUser {
    id: string;
    nickname: string;
    roles: EUserRole[];
    email: string;
    score: number;
    gameId: string | null;
    password: string;
    createdAt: Date;
    sessions?: Partial<ISession>[];
    game?: Partial<IGame>;
    hand?: Partial<IPlayerHand>[];
    votes?: Partial<IVote>[];
}
