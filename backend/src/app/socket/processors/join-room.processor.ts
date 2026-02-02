import type { ServerWebSocket } from "bun";
import { ESocketOutcomeEvent, type ISocketData } from "../types/types";
import { websocketInstance } from "../websocket.manager";

export const processJoinRoom = async (
	ws: ServerWebSocket<ISocketData>,
	data: { roomId: string },
) => {
	websocketInstance.joinRoom(ws.data.userId, data.roomId);
	websocketInstance.sendToRoom(data.roomId, {
		event: ESocketOutcomeEvent.JOINED_TO_ROOM,
		data: { userId: ws.data.userId },
	});
};
