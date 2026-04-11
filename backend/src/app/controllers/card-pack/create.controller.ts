import { db } from 'database/data-source';
import { CardPackRepo } from 'database/repositories';
import type { Context } from 'elysia';
import { randomUUID } from 'node:crypto';
import { deleteFile, uploadFile } from 's3/util';
import type { CreateCardPackDto, TokenPayload } from 'shared';

export const createCardPack = async ({
    body,
    user,
    set,
}: Pick<Context, 'set'> & {
    body: CreateCardPackDto;
    user: TokenPayload;
}) => {
    const { name, cards } = body;
    const uploadedKeys: string[] = [];

    try {
        const uploadTasks = cards.map(async (file: File) => {
            const ext = file.name.split('.').pop();
            const key = `cards/${randomUUID()}.${ext}`;

            const buffer = new Uint8Array(await file.arrayBuffer());
            const url = await uploadFile(key, buffer, file.type);

            uploadedKeys.push(key);
            return url;
        });

        const urls = await Promise.all(uploadTasks);

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const result = await CardPackRepo.createWithCards(
                { name, creatorId: user.userId, urls },
                client,
            );
            await client.query('COMMIT');
            set.status = 201;
            return { success: true, data: result };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Ошибка при создании пака:', error);

        if (uploadedKeys.length > 0) {
            await Promise.allSettled(uploadedKeys.map((key) => deleteFile(key)));
        }

        set.status = 500;
        return { success: false, message: 'Не удалось создать пак' };
    }
};
