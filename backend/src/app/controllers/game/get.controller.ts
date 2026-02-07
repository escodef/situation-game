import { GameRepo } from 'src/database/repositories';
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
                    error: z.flattenError(parseResult.error),
                },
                { status: 422 },
            );
        }

        const { page: vPage, take: vTake } = parseResult.data;
        const offset = (vPage - 1) * vTake;

        const { games, total } = await GameRepo.findOpenGames(vTake, offset);

        const totalPages = Math.ceil(total / vTake);

        return Response.json(
            {
                success: true,
                data: games,
                meta: {
                    totalCount: total,
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
