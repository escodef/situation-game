import type { IGame } from "src/shared/interfaces/game.interface";
import { db } from "../data-source";

export const GamesRepo = {
	async findOne(codeOrId: string) {
		const sql = `
            SELECT * FROM "games"
            WHERE id = $1 or code = $2"
			LIMIT 1
        `;
		const { rows } = await db.query<IGame>(sql, [codeOrId, codeOrId]);
		return rows[0];
	},

	async create(data: {
		code: string;
		ownerId: string;
		maxPlayers: number;
		isOpen: boolean;
	}): Promise<IGame> {
		const sql = `
            INSERT INTO "games" (code, owner_id, max_players, is_open)
            VALUES ($1, $2, $3)
            RETURNING id, code, owner_id AS "ownerId", token, expires_at AS "expiresAt", created_at AS "createdAt"
        `;
		const { rows } = await db.query<IGame>(sql, [
			data.code,
			data.ownerId,
			data.maxPlayers,
			data.isOpen,
		]);
		return rows[0];
	},
};
