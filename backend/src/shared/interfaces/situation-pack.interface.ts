import type { ISituation } from "./situation.interface";

export interface ISituationPack {
	id: string;
	name: string;
	situations?: ISituation[];
}
