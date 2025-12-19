import { ServerWebSocket } from "bun";
import { SocketData } from "../interfaces/message.interface";

export const processPlayCard = async (ws: ServerWebSocket<SocketData>, data: any) => {
    console.log(`User ${ws.data.userId} played a card`);
};