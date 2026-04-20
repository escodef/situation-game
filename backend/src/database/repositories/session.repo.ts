import { AUTH_CONFIG, type ISession } from 'shared';
import { db } from '../data-source';

export const SessionRepo = {
    async findByAccess(accessToken: string): Promise<ISession | undefined> {
        const sql = 'SELECT * FROM "sessions" WHERE access_token = $1';
        const { rows } = await db.query<ISession>(sql, [accessToken]);
        return rows[0];
    },

    async findByOldRefresh(oldRefreshToken: string): Promise<ISession | undefined> {
        const sql = `
            SELECT 
                s.id, 
                s.access_token AS "accessToken",
                s.refresh_token AS "refreshToken", 
                s.expires_at AS "expiresAt", 
                s.created_at AS "createdAt",
                s.user_id AS "userId",
                json_build_object(
                    'id', u.id,
                    'nickname', u.nickname,
                    'email', u.email,
                    'roles', u.roles
                ) AS user
            FROM "sessions" s
            JOIN "users" u ON s.user_id = u.id
            WHERE s.refresh_token = $1;
        `;

        const { rows } = await db.query<ISession>(sql, [oldRefreshToken]);
        return rows[0];
    },

    async deleteByRefresh(refreshToken: string): Promise<void> {
        const sql = 'DELETE FROM "sessions" WHERE refresh_token = $1';
        await db.query<ISession>(sql, [refreshToken]);
    },

    async deleteByAccess(accessToken: string): Promise<void> {
        const sql = 'DELETE FROM "sessions" WHERE access_token = $1';
        await db.query<ISession>(sql, [accessToken]);
    },

    async create(data: {
        userId: string;
        accessToken: string;
        refreshToken: string;
    }): Promise<ISession | undefined> {
        const refreshExpires = AUTH_CONFIG.refreshExpiresMs;
        const expiresAt = new Date(Date.now() + refreshExpires);
        const sql = `
            INSERT INTO "sessions" (user_id, access_token, refresh_token, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id AS "userId", access_token AS "accessToken", 
			refresh_token AS "refreshToken", expires_at AS "expiresAt", created_at AS "createdAt"
        `;
        const { rows } = await db.query<ISession>(sql, [
            data.userId,
            data.accessToken,
            data.refreshToken,
            expiresAt,
        ]);
        return rows[0];
    },
};
