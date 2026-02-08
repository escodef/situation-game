import type { IGame } from 'src/shared/interfaces/game.interface';
import { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const GameRepo = {
    async findOpenGames(
        limit: number,
        offset: number,
        client: Queryable = db,
    ): Promise<{ games: IGame[]; total: number }> {
        const gamesSql = `
            SELECT 
                id, 
                code, 
                owner_id AS "ownerId", 
                status, 
                max_players AS "maxPlayers", 
                max_rounds AS "maxRounds", 
                date_created AS "dateCreated", 
                is_open AS "isOpen"
            FROM games
            WHERE is_open = true
            LIMIT $1 OFFSET $2;
        `;

        const countSql = `
            SELECT COUNT(*)::int AS total 
            FROM games 
            WHERE is_open = true;
        `;

        const [gamesRes, countRes] = await Promise.all([
            client.query<IGame>(gamesSql, [limit, offset]),
            client.query<{ total: number }>(countSql),
        ]);

        return {
            games: gamesRes.rows,
            total: countRes.rows[0]?.total || 0,
        };
    },

    async findByOwnerId(ownerId: string, client: Queryable = db): Promise<IGame | null> {
        const sql =
            'SELECT id, status, code, max_players as "maxPlayers" FROM "games" WHERE owner_id = $1';
        const { rows } = await client.query(sql, [ownerId]);
        return rows[0] || null;
    },

    async updateStatus(gameId: string, status: string, client: Queryable = db): Promise<void> {
        const sql = 'UPDATE "games" SET status = $1 WHERE id = $2';
        await client.query(sql, [status, gameId]);
    },

    async findByCode(codeOrId: string, client: Queryable = db) {
        const sql = `
            SELECT 
                g.id, 
                g.code, 
                g.owner_id AS "ownerId", 
                g.status, 
                g.max_players AS "maxPlayers", 
                g.max_rounds AS "maxRounds", 
                g.date_created AS "dateCreated", 
                g.is_open AS "isOpen",
            FROM games g
            WHERE g.id = $1 OR g.code = $1;
        `;
        const { rows } = await client.query<IGame>(sql, [codeOrId]);
        return rows[0];
    },

    async findOne(id: string, client: Queryable = db) {
        const sql = `
            SELECT 
                g.id, 
                g.code, 
                g.owner_id AS "ownerId", 
                g.status, 
                g.max_players AS "maxPlayers", 
                g.max_rounds AS "maxRounds", 
                g.date_created AS "dateCreated", 
                g.is_open AS "isOpen",
                (SELECT COALESCE(json_agg(json_build_object(
                    'id', u.id, 
                    'nickname', u.nickname, 
                    'score', u.score
                )), '[]') FROM users u WHERE u.game_id = g.id) AS "players",
                (SELECT COALESCE(json_agg(json_build_object(
                    'id', r.id, 
                    'roundNumber', r.round_number, 
                    'status', r.status,
                    'situationId', r.situation_id
                )), '[]') FROM game_rounds r WHERE r.game_id = g.id) AS "rounds",
                (SELECT COALESCE(json_agg(json_build_object(
                    'id', sp.id, 
                    'name', sp.name
                )), '[]') FROM situation_packs sp 
                JOIN game_situation_packs gsp ON sp.id = gsp.situation_pack_id 
                WHERE gsp.game_id = g.id) AS "situationPacks",
                (SELECT COALESCE(json_agg(json_build_object(
                    'id', cp.id, 
                    'name', cp.name
                )), '[]') FROM card_packs cp 
                JOIN game_card_packs gcp ON cp.id = gcp.card_pack_id 
                WHERE gcp.game_id = g.id) AS "cardPacks"
            FROM games g
            WHERE g.id = $1;
        `;
        const { rows } = await client.query<IGame>(sql, [id]);
        return rows[0];
    },

    async create(data: {
        code: string;
        ownerId: string;
        maxPlayers: number;
        maxRounds: number;
        isOpen: boolean;
        situationPacksIds: string[];
        cardPacksIds: string[];
    }): Promise<IGame> {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const gameSql = `
            INSERT INTO "games" (code, owner_id, max_players, max_rounds, is_open)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, code, owner_id AS "ownerId", max_players AS "maxPlayers", 
                      max_rounds AS "maxRounds", is_open AS "isOpen", date_created AS "createdAt"
        `;
            const { rows } = await client.query<IGame>(gameSql, [
                data.code,
                data.ownerId,
                data.maxPlayers,
                data.maxRounds,
                data.isOpen,
            ]);
            const game = rows[0];

            const sitSql = `
                INSERT INTO "game_situation_packs" (game_id, situation_pack_id)
                SELECT $1, unnest($2::uuid[])
            `;
            await client.query(sitSql, [game.id, data.situationPacksIds]);

            const cardSql = `
                INSERT INTO "game_card_packs" (game_id, card_pack_id)
                SELECT $1, unnest($2::uuid[])
            `;
            await client.query(cardSql, [game.id, data.cardPacksIds]);

            await client.query('COMMIT');
            return game;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },
};
