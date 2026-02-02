import type { EGameStatus } from "../enums";
import type { IUser } from "./user.interface";

export interface IGame {
	id: string;
	code: string;
	ownerId: string;
	status: EGameStatus;
	maxPlayers: number;
	dateCreated: Date;
	isOpen: boolean;
	players?: Partial<IUser>[];
}
