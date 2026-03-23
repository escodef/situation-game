import type { ICardPack } from 'src/shared';
import type { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const CardPackRepo = {
    async findAll(
        page: number,
        take: number,
        client: Queryable = db,
    ): Promise<{ items: ICardPack[]; total: number }> {
        const offset = (page - 1) * take;

        const sql = `
            SELECT 
                id, 
                name, 
                created_at as "createdAt", 
                creator_id as "creatorId",
                COUNT(*) OVER() as total_count
            FROM "card_packs"
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const { rows } = await client.query(sql, [take, offset]);

        return {
            items: rows.map((row) => {
                const { total_count, ...item } = row;
                return item;
            }),
            total: rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0,
        };
    },

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
