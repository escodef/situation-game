import { IRefreshToken } from 'src/shared/interfaces/refresh-token.interface';
import { db } from '../data-source';

export const RefreshTokenRepo = {
    async findByOldRefresh(oldRefreshToken: string): Promise<IRefreshToken | null> {
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
            FROM "refresh_tokens" rt
            JOIN "user" u ON rt.user_id = u.id
            WHERE rt.token = $1;
        `;

        const { rows } = await db.query<IRefreshToken>(sql, [oldRefreshToken]);
        return rows[0] || null;
    },

    async deleteByRefresh(refreshToken: string) {
        const sql = 'DELETE FROM "refresh_tokens" WHERE refresh_token = $1';
        return await db.query<IRefreshToken>(sql, [refreshToken]);
    },

    async deleteByAccess(accessToken: string) {
        const sql = 'DELETE FROM "refresh_tokens" WHERE access_token = $1';
        return await db.query<IRefreshToken>(sql, [accessToken]);
    },

    async create(data: {
        userId: string;
        accessToken: string;
        refreshToken: string;
    }): Promise<IRefreshToken> {
        const expiresInDays = Number(process.env.JWT_REFRESH_EXPIRES_IN);
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
        const sql = `
            INSERT INTO "refresh_tokens" (user_id, access_token, refresh_token, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id AS "userId", token, expires_at AS "expiresAt", created_at AS "createdAt"
        `;
        const { rows } = await db.query<IRefreshToken>(sql, [
            data.userId,
            data.accessToken,
            data.refreshToken,
            expiresAt,
        ]);
        return rows[0];
    },
};
