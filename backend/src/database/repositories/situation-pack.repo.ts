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
};
