import { db } from 'database/data-source';

const cards = [
    'https://i.imgflip.com/30b1gx.jpg',
    'https://i.imgflip.com/1g8my4.jpg',
    'https://i.imgflip.com/261o3j.jpg',
    'https://i.imgflip.com/1ur9b0.jpg',
    'https://i.imgflip.com/2fm6x.jpg',
    'https://i.imgflip.com/4t0m5.jpg',
    'https://i.imgflip.com/1otk96.jpg',
    'https://i.imgflip.com/3lmzyx.jpg',
    'https://i.imgflip.com/2gnnjh.jpg',
    'https://i.imgflip.com/1bij.jpg',
];

export const seedCards = async () => {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            'SELECT COUNT(*) AS count FROM "card_packs" WHERE name = $1',
            ['Стандартный'],
        );

        if (Number.parseInt(rows[0].count, 10) > 0) {
            return;
        }

        await client.query('BEGIN');

        const packRes = await client.query(
            'INSERT INTO "card_packs" (name) VALUES ($1) RETURNING id',
            ['Стандартный'],
        );
        const packId = packRes.rows[0].id;

        const values: string[] = [];
        const placeholders: string[] = [];
        let counter = 1;

        cards.forEach((card) => {
            values.push(card, packId);
            placeholders.push(`($${counter++}, $${counter++})`);
        });

        if (values.length > 0) {
            const sql = `
                INSERT INTO "cards" (url, card_pack_id)
                VALUES ${placeholders.join(', ')}
            `;
            await client.query(sql, values);
        }

        await client.query('COMMIT');
        console.log(
            `Сидер стандартного пака карточек выполнен, общее число карточек: ${placeholders.length}.`,
        );
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Сидер упал с ошибкой:', error);
    } finally {
        client.release();
    }
};
