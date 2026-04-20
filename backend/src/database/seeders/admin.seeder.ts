import { db } from 'database/data-source';
import { EUserRole, getOrThrow } from 'shared';

export const seedAdmin = async () => {
    const client = await db.connect();
    try {
        const adminEmail = getOrThrow(Bun.env.ADMIN_EMAIL);
        const adminPassword = getOrThrow(Bun.env.ADMIN_PASSWORD);
        const adminNickname = getOrThrow(Bun.env.ADMIN_NICKNAME);

        await client.query('BEGIN');

        const hashedPassword = await Bun.password.hash(adminPassword);

        const roles = [EUserRole.USER, EUserRole.ADMIN];

        const sql = `
            INSERT INTO "users" (nickname, email, password, roles) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE 
            SET 
                nickname = EXCLUDED.nickname,
                password = EXCLUDED.password,
                roles = EXCLUDED.roles
        `;

        await client.query(sql, [adminNickname, adminEmail, hashedPassword, roles]);

        await client.query('COMMIT');
        console.log(
            `Сидер админа выполнен. Данные администратора (${adminEmail}) созданы или обновлены.`,
        );
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Сидер админа упал с ошибкой:', error);
    } finally {
        client.release();
    }
};
