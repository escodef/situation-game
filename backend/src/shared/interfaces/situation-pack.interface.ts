import type { ISituation } from './situation.interface';

export interface ISituationPack {
    id: string;
    name: string;
    createdAt: Date;
    situations?: ISituation[];
}
