import type { EUserRole } from '../enums/role.enum';
import type { ISession } from './session.interface';

export interface IUser {
    id: string;
    nickname: string;
    roles: EUserRole[];
    email: string;
    score: number;
    gameId: string | null;
    password?: string;
    sessions?: ISession[];
}
