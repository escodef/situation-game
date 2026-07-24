import type { IPlayerMove, Queryable } from 'shared';
import { db } from '../data-source';

export const PlayerMoveRepo = {
    async hasUserMoved(roundId: string, userId: string, client: Queryable = db): Promise<boolean> {
        const sql = 'SELECT 1 FROM "player_moves" WHERE round_id = $1 AND user_id = $2';
        const { rows } = await client.query(sql, [roundId, userId]);
        return rows.length > 0;
    },

    async makeMove(
        roundId: string,
        userId: string,
        cardId: string,
        client: Queryable = db,
    ): Promise<void> {
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

    async forceRandomMoves(roundId: string, client: Queryable = db): Promise<void> {
        const sql = `
            WITH unselected_players AS (
                SELECT ph.user_id, ph.card_id, ph.game_id,
                       ROW_NUMBER() OVER (PARTITION BY ph.user_id ORDER BY RANDOM()) as rn
                FROM "player_hands" ph
                JOIN "game_rounds" gr ON ph.game_id = gr.game_id
                WHERE gr.id = $1 
                  AND ph.user_id NOT IN (
                      SELECT user_id FROM "player_moves" WHERE round_id = $1
                  )
            ),
            forced_cards AS (
                SELECT user_id, card_id, game_id
                FROM unselected_players
                WHERE rn = 1
            ),
            inserted_moves AS (
                INSERT INTO "player_moves" (round_id, user_id, card_id)
                SELECT $1, user_id, card_id FROM forced_cards
                RETURNING user_id, card_id
            )
            DELETE FROM "player_hands" ph
            USING inserted_moves im
            WHERE ph.user_id = im.user_id 
              AND ph.card_id = im.card_id 
              AND ph.game_id = (SELECT game_id FROM "game_rounds" WHERE id = $1);
        `;
        await client.query(sql, [roundId]);
    },

    async getMovesWithCards(roundId: string, client: Queryable = db): Promise<IPlayerMove[]> {
        const sql = `
            SELECT 
                pm.round_id as "roundId", 
                pm.user_id as "userId", 
                pm.card_id as "cardId",
                c.url as "cardUrl"
            FROM "player_moves" pm
            JOIN "cards" c ON pm.card_id = c.id
            WHERE pm.round_id = $1
        `;
        const { rows } = await client.query<IPlayerMove & { cardUrl: string }>(sql, [roundId]);

        return rows.map((row) => ({
            roundId: row.roundId,
            userId: row.userId,
            cardId: row.cardId,
            card: {
                url: row.cardUrl,
            },
        }));
    },
};
