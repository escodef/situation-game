import { TokenPayload } from 'src/shared';
import z from 'zod';

const createSituationPackSchema = z.object({
    name: z.string().min(3, 'Название слишком короткое').max(100, 'Название слишком длинное'),
    situations: z.array(z.string()).min(3),
});

export const createSituationPack = async (req: Request, _: TokenPayload): Promise<Response> => {
    const body = await req.json();

    const parseResult = createSituationPackSchema.safeParse(body);
    if (!parseResult.success) {
        return Response.json(
            { success: false, error: z.flattenError(parseResult.error) },
            { status: 400 },
        );
    }

    const { name, situations } = parseResult.data;

    return Response.json({ success: true, count: situations.length }, { status: 201 });
};
