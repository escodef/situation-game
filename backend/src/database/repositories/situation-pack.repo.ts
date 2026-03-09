import { ISituation } from 'src/shared';
import { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const SituationPackRepo = {
    async getRandomForGame(gameId: string, client: Queryable = db): Promise<ISituation> {
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
        const { rows } = await client.query(sql, [gameId]);
        return rows[0];
    },

    async createWithSituations(
        data: { name: string; creatorId: string; situations: string[] },
        client: Queryable = db,
    ) {
        return await client.query('BEGIN').then(async () => {
            try {
                const packRes = await client.query(
                    'INSERT INTO "situation_packs" (name, creator_id) VALUES ($1, $2) RETURNING id',
                    [data.name, data.creatorId],
                );
                const packId = packRes.rows[0].id;

                if (data.situations.length > 0) {
                    const values = data.situations.map((_, i) => `($1, $${i + 2})`).join(',');
                    const sql = `INSERT INTO "situations" (situation_pack_id, text) VALUES ${values}`;
                    await client.query(sql, [packId, ...data.situations]);
                }

                await client.query('COMMIT');
                return { id: packId, name: data.name, count: data.situations.length };
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
        });
    },
};
