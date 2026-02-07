import { ESocketIncomeEvent } from '../enums';

export interface ISocketIncomeMessage<T = unknown> {
    event: ESocketIncomeEvent;
    data: T;
}

export interface ISocketData {
    userId: string;
    gameId?: string;
}
