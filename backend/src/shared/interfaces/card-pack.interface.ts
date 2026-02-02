import type { ICard } from "./card.interface";

export interface ICardPack {
	id: string;
	name: string;
	cards?: ICard[];
}
