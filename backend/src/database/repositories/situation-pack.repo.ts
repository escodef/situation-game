import type { ISituation, ISituationPack, Queryable } from 'shared';
import { db } from '../data-source';

export const SituationPackRepo = {
    async findAll(
        page: number,
        take: number,
        client: Queryable = db,
    ): Promise<{ items: ISituationPack[]; total: number }> {
        const offset = (page - 1) * take;

        const sql = `
            SELECT 
                id, 
                name, 
                created_at as "createdAt", 
                creator_id as "creatorId",
                COUNT(*) OVER() as total_count
            FROM "situation_packs"
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

    async getRandomForGame(
        gameId: string,
        client: Queryable = db,
    ): Promise<ISituation | undefined> {
        const sql = `
            SELECT s.id, s.text 
            FROM "situations" s
            JOIN "game_situation_packs" gsp ON s.situation_pack_id = gsp.situation_pack_id
            WHERE gsp.game_id = $1
            AND s.id NOT IN (
                SELECT situation_id 
                FROM "game_rounds" 
                WHERE game_id = $1 AND situation_id IS NOT NULL
            )
            ORDER BY RANDOM()
            LIMIT 1
        `;
        const { rows } = await client.query<ISituation>(sql, [gameId]);
        return rows[0];
    },

    async createWithSituations(
        data: {
            name: string;
            creatorId: string;
            situations: { text: string; isAdult: boolean; category: string }[];
        },
        client: Queryable,
    ) {
        const packRes = await client.query(
            'INSERT INTO "situation_packs" (name, creator_id) VALUES ($1, $2) RETURNING id',
            [data.name, data.creatorId],
        );
        const packId = packRes.rows[0].id;

        if (data.situations.length > 0) {
            const columns = ['situation_pack_id', 'text', 'is_adult', 'category'];
            const valuesPlaceholder = data.situations
                .map((_, i) => {
                    const offset = i * 4;
                    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
                })
                .join(',');

            const flatValues = data.situations.flatMap((s) => [
                packId,
                s.text,
                s.isAdult,
                s.category,
            ]);

            const sql = `INSERT INTO "situations" (${columns.join(', ')}) VALUES ${valuesPlaceholder}`;
            await client.query(sql, flatValues);
        }

        return { id: packId, name: data.name, count: data.situations.length };
    },
};
