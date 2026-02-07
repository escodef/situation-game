import { ICard } from "./card.interface";

export interface IPlayerMove {
    id: string;
    roundId: string;
    userId: string;
    cardId: string;
    card?: Partial<ICard>;
}
