import { EUserRole } from 'src/shared/enums/role.enum';
import { IUser } from 'src/shared/interfaces/user.interface';
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

    async create(data: { email: string; passwordHash: string; nickname: string }): Promise<IUser> {
        const sql = `
            INSERT INTO "users" (email, password, nickname, roles)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, nickname, roles, age, game_id as "gameId"
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
