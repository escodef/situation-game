import { EUserRole } from 'src/shared/enums/role.enum';
import type { IUser } from 'src/shared/interfaces/user.interface';
import type { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const UserRepo = {
    async findByEmailForAuth(email: string): Promise<IUser | null> {
        const sql = 'SELECT * FROM "users" WHERE email = $1';
        const { rows } = await db.query<IUser>(sql, [email]);
        return rows[0] || null;
    },

    async findWithGame(userId: string, client: Queryable = db): Promise<IUser | null> {
        const sql = `
        SELECT 
            u.id, u.nickname, u.email, u.roles, u.score, u.game_id as "gameId",
            g.id as "g_id", g.code as "g_code", g.status as "g_status", g.owner_id as "g_owner_id"
        FROM "users" u
        LEFT JOIN "games" g ON u.game_id = g.id
        WHERE u.id = $1
    `;
        const { rows } = await client.query(sql, [userId]);
        const row = rows[0];

        if (!row) return null;

        return {
            id: row.id,
            nickname: row.nickname,
            password: row.password,
            createdAt: row.createdAt,
            email: row.email,
            roles: row.roles,
            score: row.score,
            gameId: row.gameId,
            game: row.g_id
                ? {
                      id: row.g_id,
                      code: row.g_code,
                      status: row.g_status,
                      ownerId: row.g_owner_id,
                  }
                : undefined,
        };
    },

    async countPlayersInGame(gameId: string, client: Queryable = db): Promise<number> {
        const sql = 'SELECT COUNT(*)::int as count FROM "users" WHERE game_id = $1';
        const { rows } = await client.query<{ count: number }>(sql, [gameId]);
        return rows[0]?.count || 0;
    },

    async getPlayersByGameId(gameId: string, client: Queryable = db): Promise<IUser[]> {
        const sql = 'SELECT id, nickname, score FROM "users" WHERE game_id = $1';
        const { rows } = await client.query(sql, [gameId]);
        return rows;
    },

    async findById(id: string, client: Queryable = db): Promise<IUser | null> {
        const sql =
            'SELECT id, nickname, email, roles, age, game_id as "gameId" FROM "users" WHERE id = $1';
        const { rows } = await client.query<IUser>(sql, [id]);
        return rows[0] || null;
    },

    async joinGame(userId: string, gameId: string, client: Queryable = db): Promise<void> {
        const sql = `
            UPDATE "users" 
            SET game_id = $1, score = 0 
            WHERE id = $2
        `;
        await client.query(sql, [gameId, userId]);
    },

    async leaveGame(userId: string, client: Queryable = db): Promise<void> {
        const sql = `
            UPDATE "users" 
            SET game_id = NULL, score = 0 
            WHERE id = $1
        `;
        await client.query(sql, [userId]);
    },

    async create(data: {
        email: string;
        passwordHash: string;
        nickname: string;
    }): Promise<IUser | undefined> {
        const sql = `
            INSERT INTO "users" (email, password, nickname, roles)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, nickname, roles, game_id as "gameId"
        `;
        const { rows } = await db.query<IUser>(sql, [
            data.email,
            data.passwordHash,
            data.nickname,
            [EUserRole.USER],
        ]);
        return rows[0];
    },
};
