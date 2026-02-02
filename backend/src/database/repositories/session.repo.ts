import type { ISession } from 'src/shared/interfaces/session.interface';
import { db } from '../data-source';

export const SessionRepo = {
    async findByOldRefresh(oldRefreshToken: string): Promise<ISession | null> {
        const sql = `
            SELECT 
                rt.id, 
                rt.token, 
                rt.expires_at AS "expiresAt", 
                rt.created_at AS "createdAt",
                rt.user_id AS "userId",
                json_build_object(
                    'id', u.id,
                    'nickname', u.nickname,
                    'email', u.email,
                    'roles', u.roles
                ) AS user
            FROM "sessions" rt
            JOIN "user" u ON rt.user_id = u.id
            WHERE rt.token = $1;
        `;

        const { rows } = await db.query<ISession>(sql, [oldRefreshToken]);
        return rows[0] || null;
    },

    async deleteByRefresh(refreshToken: string) {
        const sql = 'DELETE FROM "sessions" WHERE refresh_token = $1';
        return await db.query<ISession>(sql, [refreshToken]);
    },

    async deleteByAccess(accessToken: string) {
        const sql = 'DELETE FROM "sessions" WHERE access_token = $1';
        return await db.query<ISession>(sql, [accessToken]);
    },

    async create(data: {
        userId: string;
        accessToken: string;
        refreshToken: string;
    }): Promise<ISession> {
        const expiresInDays = Number(process.env.JWT_REFRESH_EXPIRES_IN);
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
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
