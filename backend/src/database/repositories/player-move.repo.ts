import type { IPlayerMove, Queryable } from 'shared';
import { db } from '../data-source';

export const PlayerMoveRepo = {
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

    async forceRandomMoves(roundId: string, client: Queryable = db) {
        const sql = `
            INSERT INTO "player_moves" (round_id, user_id, card_id)
            SELECT $1, ph.user_id, ph.card_id
            FROM "player_hands" ph
            JOIN "game_rounds" gr ON ph.game_id = gr.game_id
            WHERE gr.id = $1 
            AND ph.user_id NOT IN (SELECT user_id FROM "player_moves" WHERE round_id = $1)
            DISTINCT ON (ph.user_id)
        `;
        await client.query(sql, [roundId]);
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
