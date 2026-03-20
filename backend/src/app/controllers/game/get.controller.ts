import { GameRepo } from 'src/database/repositories';

export const getGames = async (page: number, take: number): Promise<Response> => {
    try {
        const offset = (page - 1) * take;

        const { games, total } = await GameRepo.findOpenGames(take, offset);

        const totalPages = Math.ceil(total / take);

        return Response.json(
            {
                success: true,
                data: games,
                meta: {
                    totalCount: total,
                    totalPages,
                    currentPage: page,
                    hasPrepage: page > 1,
                    hasNextPage: page < totalPages,
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
