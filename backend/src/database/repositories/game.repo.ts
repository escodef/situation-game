import { IGame } from 'src/shared/interfaces/game.interface';
import { db } from '../data-source';

export const GamesRepo = {
    async findByCode(code: string) {
        const sql = `
            SELECT * INTO "games" (code, owner_id, max_players, is_open)
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
