import { randomUUID } from 'node:crypto';
import { CardPackRepo } from 'src/database/repositories';
import { deleteFile, uploadFile } from 'src/s3/util';
import type { TokenPayload } from 'src/shared';
import type { CreateCardPackDto } from 'src/shared/schemas/card-pack.schema';

export const createCardPack = async ({
    body,
    user,
    set,
}: {
    body: CreateCardPackDto;
    user: TokenPayload;
    set: any;
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

        const result = await CardPackRepo.createWithCards({
            name,
            creatorId: user.userId,
            urls,
        });

        set.status = 201;
        return { success: true, data: result };
    } catch (error) {
        console.error('Ошибка при создании пака:', error);

        if (uploadedKeys.length > 0) {
            await Promise.allSettled(uploadedKeys.map((key) => deleteFile(key)));
        }

        set.status = 500;
        return { success: false, message: 'Не удалось создать пак' };
    }
};
