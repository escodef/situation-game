import type { ICard } from './card.interface';

export interface ICardPack {
    id: string;
    name: string;
    createdAt: Date;
    creatorId: string;
    cards?: ICard[];
}
