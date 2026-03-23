import { GameRepo } from 'src/database/repositories';
import type { GetGamesDto } from 'src/shared';

export const getGames = async ({
    query: { page, take },
    set,
}: {
    query: GetGamesDto;
    set: any;
}) => {
    try {
        const offset = (page - 1) * take;

        const { games, total } = await GameRepo.findOpenGames(take, offset);

        const totalPages = Math.ceil(total / take);

        return {
            success: true,
            data: games,
            meta: {
                totalCount: total,
                totalPages,
                currentPage: page,
                hasPrepage: page > 1,
                hasNextPage: page < totalPages,
            },
        };
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
