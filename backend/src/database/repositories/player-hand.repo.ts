import type { ICard, Queryable } from 'shared';
import { db } from '../data-source';

export const PlayerHandRepo = {
    async takeCardFromHand(
        userId: string,
        cardId: string,
        gameId: string,
        client: Queryable = db,
    ): Promise<boolean> {
        const sql =
            'DELETE FROM "player_hands" WHERE user_id = $1 AND card_id = $2 AND game_id = $3';
        const { rowCount } = await client.query(sql, [userId, cardId, gameId]);
        return rowCount ? rowCount > 0 : false;
    },

    async fillDeck(gameId: string, client: Queryable = db): Promise<void> {
        const sql = `
            INSERT INTO "player_hands" (game_id, user_id, card_id)
            WITH shuffled_cards AS (
                SELECT c.id as card_id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as card_idx
                FROM "cards" c
                JOIN "game_card_packs" gcp ON c.card_pack_id = gcp.card_pack_id
                WHERE gcp.game_id = $1
            ),
            player_list AS (
                SELECT id as user_id, ROW_NUMBER() OVER () as player_idx
                FROM "users"
                WHERE game_id = $1
            ),
            player_count AS (
                SELECT count(*)::int as total FROM player_list
            )
            SELECT $1, p.user_id, sc.card_id
            FROM shuffled_cards sc
            JOIN player_list p ON ((sc.card_idx - 1) % (SELECT total FROM player_count)) + 1 = p.player_idx;
        `;
        await client.query(sql, [gameId]);
    },

    async getHand(userId: string, gameId: string, client: Queryable = db): Promise<ICard[]> {
        const sql = `
            SELECT c.id, c.url 
            FROM "cards" c
            JOIN "player_hands" ph ON c.id = ph.card_id
            WHERE ph.user_id = $1 AND ph.game_id = $2
            ORDER BY ph.id ASC
            LIMIT 5;
        `;
        const { rows } = await client.query(sql, [userId, gameId]);
        return rows;
    },

    async clearAllGameData(gameId: string, client: Queryable = db): Promise<void> {
        await client.query('DELETE FROM "player_hands" WHERE game_id = $1', [gameId]);
    },
};
