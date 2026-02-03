import type { EUserRole } from '../enums/role.enum';
import { IGame } from './game.interface';
import { IPlayerHand } from './player-hand.interface';
import type { ISession } from './session.interface';
import { IVote } from './vote.interface';

export interface IUser {
    id: string;
    nickname: string;
    roles: EUserRole[];
    email: string;
    score: number;
    gameId: string | null;
    password?: string;
    sessions?: Partial<ISession>[];
    game?: Partial<IGame>;
    hand?: Partial<IPlayerHand>[];
    votes?: Partial<IVote>[];
}
