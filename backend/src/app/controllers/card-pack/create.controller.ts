import { inspect } from 'bun';
import { CardPackRepo } from 'src/database/repositories';
import { deleteFile, uploadFile } from 'src/s3/util';
import { TokenPayload } from 'src/shared';
import z from 'zod';

const createCardPackSchema = z.object({
    name: z.string().min(3, 'Название слишком короткое').max(100, 'Название слишком длинное'),
    files: z
        .array(z.instanceof(File))
        .min(1, 'Нужно загрузить хотя бы одну карточку')
        .refine(
            (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
            'Максимальный размер файла — 5MB',
        )
        .refine(
            (files) =>
                files.every((file) =>
                    ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
                ),
            'Допустимы только форматы JPEG, PNG и WebP',
        ),
});

export const createCardPack = async (req: Request, user: TokenPayload): Promise<Response> => {
    const uploadedKeys: string[] = [];

    try {
        const formData = await req.formData();
        const dataToValidate = {
            name: formData.get('name'),
            files: formData.getAll('cards'),
        };

        const parseResult = createCardPackSchema.safeParse(dataToValidate);
        if (!parseResult.success) {
            return Response.json(
                { success: false, error: z.flattenError(parseResult.error) },
                { status: 400 },
            );
        }

        const { name, files } = parseResult.data;

        const uploadTasks = files.map(async (file) => {
            const ext = file.name.split('.').pop();
            const key = `cards/${crypto.randomUUID()}.${ext}`;
            uploadedKeys.push(key);

            const body = new Uint8Array(await file.arrayBuffer());
            return { key, body, type: file.type };
        });

        const preparedFiles = await Promise.all(uploadTasks);

        const urls = await Promise.all(preparedFiles.map((f) => uploadFile(f.key, f.body, f.type)));

        try {
            const result = await CardPackRepo.createWithCards({
                name,
                creatorId: user.userId,
                urls,
            });
            return Response.json({ success: true, data: result }, { status: 201 });
        } catch (dbError) {
            console.error(inspect(dbError));
            throw dbError;
        }
    } catch (error) {
        console.error('Ошибка при создании пака:', error);

        if (uploadedKeys.length > 0) {
            Promise.all(uploadedKeys.map((key) => deleteFile(key))).catch((err) =>
                console.error('Критическая ошибка: не удалось удалить мусор из S3:', err),
            );
        }

        return Response.json(
            { success: false, message: 'Не удалось создать пак' },
            { status: 500 },
        );
    }
};
