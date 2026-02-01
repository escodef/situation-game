import { EUserRole } from '../enums/role.enum';
import { IRefreshToken } from './refresh-token.interface';

export interface IUser {
    id: string;
    nickname: string;
    roles: EUserRole[];
    age: number;
    email: string;
    gameId: string | null;
    password?: string;
    refreshTokens?: IRefreshToken[];
}
