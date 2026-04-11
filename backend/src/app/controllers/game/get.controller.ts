import { GameRepo } from 'database/repositories';
import type { Context } from 'elysia';
import type { GetGamesDto } from 'shared';

export const getGames = async ({
    query: { page, take },
    set,
}: Pick<Context, 'set'> & {
    query: GetGamesDto;
}) => {
    try {
        const offset = (page - 1) * take;

        const { games, total } = await GameRepo.findOpenGames(take, offset);

        const totalPages = Math.ceil(total / take);

        set.status = 200;

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
