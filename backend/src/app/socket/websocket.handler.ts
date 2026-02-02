import type { ServerWebSocket } from "bun";
import { processJoinRoom, processPlayCard } from "./processors";
import {
	ESocketIncomeEvent,
	type ISocketData,
	type ISocketIncomeMessage,
} from "./types/types";

export const handleMessage = async (
	ws: ServerWebSocket<ISocketData>,
	messageString: string | Buffer,
) => {
	try {
		const str =
			typeof messageString === "string"
				? messageString
				: messageString.toString();

		const message: ISocketIncomeMessage<any> = JSON.parse(str);
		if (!message.event) {
			ws.send(
				JSON.stringify({
					event: "error",
					data: "No event name provided",
				}),
			);
			return;
		}

		console.debug(
			`Event received: ${message.event} from User ${ws.data.userId}`,
		);

		switch (message.event) {
			case ESocketIncomeEvent.JOIN_ROOM:
				await processJoinRoom(ws, message.data);
				break;

			case ESocketIncomeEvent.PLAY_CARD:
				await processPlayCard(ws, message.data);
				break;

			default:
				ws.send(JSON.stringify({ event: "error", data: "Unknown event" }));
		}
	} catch (error) {
		console.error("Error handling message:", error);
		ws.send(JSON.stringify({ event: "error", data: "Invalid message format" }));
	}
};
