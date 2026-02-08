import { ICard } from './card.interface';

export interface IPlayerMove {
    roundId: string;
    userId: string;
    cardId: string;
    card?: Partial<ICard>;
}
