import type { IUser } from './user.interface';

export interface ISession {
    id: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    user?: Partial<IUser>;
}
