import { count, eq } from 'drizzle-orm';
import { db } from 'src/database/data-source';
import { gamesTable } from 'src/database/schemas';
import z from 'zod';

const getGameDto = z.object({
    page: z.number().default(1),
    take: z.number().default(10),
});

export const getGames = async (req: Request): Promise<Response> => {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const take = Number(searchParams.get('take')) || 10;

        const parseResult = getGameDto.safeParse({ take, page });

        if (!parseResult.success) {
            return Response.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: z.treeifyError(parseResult.error).errors,
                },
                { status: 422 },
            );
        }

        const { page: vPage, take: vTake } = parseResult.data;
        const offset = (vPage - 1) * vTake;

        const [games, totalResult] = await Promise.all([
            db
                .select()
                .from(gamesTable)
                .where(eq(gamesTable.isOpen, true))
                .limit(vTake)
                .offset(offset),
            db.select({ value: count() }).from(gamesTable).where(eq(gamesTable.isOpen, true)),
        ]);

        const totalCount = totalResult[0].value;
        const totalPages = Math.ceil(totalCount / vTake);

        return Response.json(
            {
                success: true,
                data: games,
                meta: {
                    totalCount,
                    totalPages,
                    currentPage: vPage,
                    hasPrevPage: vPage > 1,
                    hasNextPage: vPage < totalPages,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('getGames() Error:', error);
        return Response.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 },
        );
    }
};
