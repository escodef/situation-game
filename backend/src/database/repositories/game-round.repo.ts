import { ERoundStatus, IGameRound, IPlayerMove } from 'src/shared';
import { Queryable } from 'src/shared/types/pg.types';
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

    async hasUserMoved(roundId: string, userId: string, client: Queryable = db): Promise<boolean> {
        const sql = 'SELECT 1 FROM "player_moves" WHERE round_id = $1 AND user_id = $2';
        const { rows } = await client.query(sql, [roundId, userId]);
        return rows.length > 0;
    },

    async makeMove(roundId: string, userId: string, cardId: string, client: Queryable = db) {
        const sql = 'INSERT INTO "player_moves" (round_id, user_id, card_id) VALUES ($1, $2, $3)';
        await client.query(sql, [roundId, userId, cardId]);
    },

    async countMovesInRound(roundId: string, client: Queryable = db): Promise<number> {
        const { rows } = await client.query(
            'SELECT COUNT(*)::int as count FROM "player_moves" WHERE round_id = $1',
            [roundId],
        );
        return rows[0].count;
    },

    async findExpiredRounds(client: Queryable = db) {
        const sql = `SELECT id, game_id FROM "game_rounds" WHERE status = 'PICKING' AND ends_at <= NOW()`;
        const { rows } = await client.query(sql);
        return rows;
    },

    async forceRandomMoves(roundId: string, client: Queryable = db) {
        const sql = `
        INSERT INTO "player_moves" (round_id, user_id, card_id)
        SELECT $1, ph.user_id, ph.card_id
        FROM "player_hands" ph
        JOIN "game_rounds" gr ON ph.game_id = gr.game_id
        WHERE gr.id = $1 
        AND ph.user_id NOT IN (SELECT user_id FROM "player_moves" WHERE round_id = $1)
        DISTINCT ON (ph.user_id) -- Берем только одну карту для каждого
    `;
        await client.query(sql, [roundId]);
    },

    async updateStatus(
        roundId: string,
        status: ERoundStatus,
        client: Queryable = db,
    ): Promise<void> {
        const sql = 'UPDATE "game_rounds" SET status = $1 WHERE id = $2';
        await client.query(sql, [status, roundId]);
    },

    async getMovesWithCards(roundId: string, client: Queryable = db): Promise<IPlayerMove[]> {
        const sql = `
            SELECT 
                pm.id, 
                pm.round_id as "roundId", 
                pm.user_id as "userId", 
                pm.card_id as "cardId",
                c.url as "cardUrl"
            FROM "player_moves" pm
            JOIN "cards" c ON pm.card_id = c.id
            WHERE pm.round_id = $1
        `;
        const { rows } = await client.query(sql, [roundId]);

        return rows.map((row) => ({
            id: row.id,
            roundId: row.roundId,
            userId: row.userId,
            cardId: row.cardId,
            card: {
                id: row.cardId,
                url: row.cardUrl,
            },
        }));
    },
};
