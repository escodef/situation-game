import { AUTH_CONFIG, type ISession } from 'shared';
import { db } from '../data-source';

export const SessionRepo = {
    async findByAccess(accessToken: string): Promise<ISession | undefined> {
        const sql = 'SELECT * FROM "sessions" WHERE access_token = $1';
        const { rows } = await db.query<ISession>(sql, [accessToken]);
        return rows[0];
    },

    async findLatestByUserId(userId: string): Promise<ISession | undefined> {
        const sql = `
            SELECT 
                id, 
                user_id AS "userId",
                access_token AS "accessToken", 
                refresh_token AS "refreshToken", 
                expires_at AS "expiresAt"
            FROM "sessions"
            WHERE user_id = $1 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        const { rows } = await db.query<ISession>(sql, [userId]);
        return rows[0];
    },

    async rotateSession(
        oldRefreshToken: string,
        newAccessToken: string,
        newRefreshToken: string,
    ): Promise<ISession | undefined> {
        const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshExpiresMs);

        const sql = `
            UPDATE "sessions"
            SET access_token = $1, refresh_token = $2, expires_at = $3
            WHERE refresh_token = $4 AND expires_at > NOW()
            RETURNING id, user_id AS "userId", access_token AS "accessToken", refresh_token AS "refreshToken", expires_at AS "expiresAt";
        `;
        const { rows } = await db.query<ISession>(sql, [
            newAccessToken,
            newRefreshToken,
            expiresAt,
            oldRefreshToken,
        ]);
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
        const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshExpiresMs);
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
