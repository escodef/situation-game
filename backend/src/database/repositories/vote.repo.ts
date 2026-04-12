import type { IVote, Queryable } from 'shared';
import { db } from '../data-source';

export const VoteRepo = {
    async create(
        roundId: string,
        voterId: string,
        targetUserId: string,
        client: Queryable = db,
    ): Promise<IVote> {
        const sql = `
            INSERT INTO "votes" (round_id, voter_id, target_user_id)
            VALUES ($1, $2, $3)
            RETURNING 
                round_id AS "roundId", 
                voter_id AS "voterId", 
                target_user_id AS "targetUserId";
        `;
        const { rows } = await client.query(sql, [roundId, voterId, targetUserId]);
        return rows[0];
    },

    async findByRound(roundId: string, client: Queryable = db): Promise<IVote[]> {
        const sql = `
            SELECT 
                round_id AS "roundId", 
                voter_id AS "voterId", 
                target_user_id AS "targetUserId"
            FROM "votes"
            WHERE round_id = $1;
        `;
        const { rows } = await client.query(sql, [roundId]);
        return rows;
    },
};
