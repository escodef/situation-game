import type { ERoundStatus, IGameRound, Queryable } from 'shared';
import { db } from '../data-source';

export const GameRoundRepo = {
    async create(
        data: { gameId: string; roundNumber: number; situationId: string; endsAt: Date },
        client: Queryable = db,
    ) {
        const sql = `
            INSERT INTO "game_rounds" (game_id, round_number, situation_id, ends_at, status)
            VALUES ($1, $2, $3, $4, 'PICKING')
            RETURNING id, ends_at as "endsAt"
        `;
        const { rows } = await client.query(sql, [
            data.gameId,
            data.roundNumber,
            data.situationId,
            data.endsAt,
        ]);
        return rows[0];
    },

    async findById(id: string, client: Queryable = db) {
        const sql = 'SELECT id, game_id as "gameId", status FROM "game_rounds" WHERE id = $1';
        const { rows } = await client.query<IGameRound>(sql, [id]);
        return rows[0];
    },

    async findExpiredRounds(client: Queryable = db) {
        const sql = `SELECT id, game_id FROM "game_rounds" WHERE status = 'PICKING' AND ends_at <= NOW()`;
        const { rows } = await client.query(sql);
        return rows;
    },

    async updateStatus(
        roundId: string,
        status: ERoundStatus,
        client: Queryable = db,
    ): Promise<void> {
        const sql = 'UPDATE "game_rounds" SET status = $1 WHERE id = $2';
        await client.query(sql, [status, roundId]);
    },

    async findCurrentRound(gameId: string, client: Queryable = db): Promise<IGameRound | null> {
        const sql = `
            SELECT 
                id, 
                game_id as "gameId", 
                round_number as "roundNumber",
                situation_id as "situationId",
                status, 
                ends_at as "endsAt"
            FROM "game_rounds"
            LEFT JOIN "users"
            ON game_rounds.game_id = users.game_id
            WHERE game_id = $1
            ORDER BY round_number DESC
            LIMIT 1
        `;
        const { rows } = await client.query<IGameRound>(sql, [gameId]);
        return rows[0] || null;
    },
};
