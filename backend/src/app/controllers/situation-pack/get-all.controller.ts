import { SituationPackRepo } from 'database/repositories';
import type { Context } from 'elysia';
import type { GetSituationPacksDto } from 'shared';

export const getAllSituationPacks = async ({
    query: { page, take },
    set,
}: Pick<Context, 'set'> & {
    query: GetSituationPacksDto;
}) => {
    const { items, total } = await SituationPackRepo.findAll(page, take);

    const totalPages = Math.ceil(total / take);

    set.status = 200;

    return {
        success: true,
        data: items,
        meta: {
            totalCount: total,
            totalPages,
            currentPage: page,
            hasPrepage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
};
