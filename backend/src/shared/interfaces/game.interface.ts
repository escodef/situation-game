import type { EGameStatus } from '../enums';
import type { ICardPack } from './card-pack.interface';
import type { IGameRound } from './game-round.interface';
import type { ISituationPack } from './situation-pack.interface';
import type { IUser } from './user.interface';

export interface IGame {
    id: string;
    code: string;
    ownerId: string;
    status: EGameStatus;
    maxPlayers: number;
    createdAt: Date;
    isOpen: boolean;
    maxRounds: number;
    players?: Partial<IUser>[];
    rounds?: Partial<IGameRound>[];
    situationPacks?: Partial<ISituationPack>[];
    cardPacks?: Partial<ICardPack>[];
}
