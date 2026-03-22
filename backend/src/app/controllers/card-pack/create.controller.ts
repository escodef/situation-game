import { CardPackRepo } from 'src/database/repositories';
import { deleteFile, uploadFile } from 'src/s3/util';
import { TokenPayload } from 'src/shared';
import { CreateCardPackDto } from 'src/shared/schemas/card-pack.schema';

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
            const key = `cards/${crypto.randomUUID()}.${ext}`;
            uploadedKeys.push(key);

            const buffer = new Uint8Array(await file.arrayBuffer());
            const url = await uploadFile(key, buffer, file.type);
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
            uploadedKeys.forEach((key) => {
                deleteFile(key).catch(console.error);
            });
        }

        set.status = 500;
        return { success: false, message: 'Не удалось создать пак' };
    }
};
