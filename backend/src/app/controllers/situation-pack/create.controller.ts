import { TokenPayload } from 'src/shared';
import z from 'zod';

const createSituationPackSchema = z.object({
    name: z.string().min(3, 'Название слишком короткое').max(100, 'Название слишком длинное'),
    file: z.instanceof(File),
});

export const createSituationPack = async (req: Request, _: TokenPayload): Promise<Response> => {
    const formData = await req.formData();

    const dataToValidate = {
        name: formData.get('name'),
        file: formData.getAll('file'),
    };

    const parseResult = createSituationPackSchema.safeParse(dataToValidate);
    if (!parseResult.success) {
        return Response.json(
            { success: false, error: z.flattenError(parseResult.error) },
            { status: 400 },
        );
    }

    const { name, file } = parseResult.data;

    if (!file || !name) return Response.json({ error: 'Data missing' }, { status: 400 });

    const content = await file.text();
    const situations = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    return Response.json({ success: true, count: situations.length });
};
