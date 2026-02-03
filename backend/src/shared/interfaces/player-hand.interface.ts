import { ICard } from './card.interface';

export interface IPlayerHand {
    id: string;
    gameId: string;
    userId: string;
    cardId: string;
    card?: Partial<ICard>;
}
