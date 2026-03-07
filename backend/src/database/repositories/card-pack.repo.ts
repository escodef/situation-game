import { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const CardPackRepo = {
    async distributeInitialCards(gameId: string, client: Queryable = db): Promise<void> {
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
            JOIN player_list p ON ((sc.card_idx - 1) % (SELECT total FROM player_count)) + 1 = p.player_idx
            WHERE sc.card_idx <= (SELECT total FROM player_count) * 5;
        `;
        await client.query(sql, [gameId]);
    },

    async takeCardFromHand(
        userId: string,
        cardId: string,
        gameId: string,
        client: Queryable = db,
    ): Promise<boolean> {
        const sql =
            'DELETE FROM "player_hands" WHERE user_id = $1 AND card_id = $2 AND game_id = $3';
        const { rowCount } = await client.query(sql, [userId, cardId, gameId]);
        return rowCount > 0;
    },

    async createWithCards(
        data: { name: string; creatorId: string; urls: string[] },
        client: Queryable = db,
    ) {
        return await client.query('BEGIN').then(async () => {
            try {
                const packRes = await client.query(
                    'INSERT INTO "card_packs" (name, creator_id) VALUES ($1, $2) RETURNING id',
                    [data.name, data.creatorId],
                );
                const packId = packRes.rows[0].id;

                if (data.urls.length > 0) {
                    const values = data.urls.map((_, i) => `($1, $${i + 2})`).join(',');
                    const sql = `INSERT INTO "cards" (card_pack_id, url) VALUES ${values}`;
                    await client.query(sql, [packId, ...data.urls]);
                }

                await client.query('COMMIT');
                return { id: packId, name: data.name, count: data.urls.length };
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
        });
    },
};
