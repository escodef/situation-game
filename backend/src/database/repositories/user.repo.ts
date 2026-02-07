import { EUserRole } from 'src/shared/enums/role.enum';
import type { IUser } from 'src/shared/interfaces/user.interface';
import { Queryable } from 'src/shared/types/pg.types';
import { db } from '../data-source';

export const UserRepo = {
    async findByEmailForAuth(email: string): Promise<IUser | null> {
        const sql = 'SELECT * FROM "users" WHERE email = $1';
        const { rows } = await db.query<IUser>(sql, [email]);
        return rows[0] || null;
    },

    async findById(id: string): Promise<IUser | null> {
        const sql =
            'SELECT id, nickname, email, roles, age, game_id as "gameId" FROM "users" WHERE id = $1';
        const { rows } = await db.query<IUser>(sql, [id]);
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

    async create(data: { email: string; passwordHash: string; nickname: string }): Promise<IUser> {
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
