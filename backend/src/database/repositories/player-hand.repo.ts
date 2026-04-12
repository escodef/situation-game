import type { Queryable } from 'shared';
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
};
