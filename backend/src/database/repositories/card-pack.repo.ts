import type { ICardPack, Queryable } from 'shared';
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

    async createWithCards(
        data: { name: string; creatorId: string; urls: string[] },
        client: Queryable,
    ) {
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
        return { id: packId, name: data.name, count: data.urls.length };
    },
};
