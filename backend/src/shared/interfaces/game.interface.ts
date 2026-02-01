import { EGameStatus } from '../enums';

export interface IGame {
    id: string;
    code: string;
    ownerId: string;
    status: EGameStatus;
    maxPlayers: number;
    dateCreated: Date;
    isOpen: boolean;
}
