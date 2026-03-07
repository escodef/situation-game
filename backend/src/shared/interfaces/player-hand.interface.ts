import { ICard } from './card.interface';

export interface IPlayerHand {
    gameId: string;
    userId: string;
    cardId: string;
    card?: Partial<ICard>;
}
