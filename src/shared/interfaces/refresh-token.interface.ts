import { IUser } from './user.interface';

export interface IRefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    user?: Partial<IUser>;
}
