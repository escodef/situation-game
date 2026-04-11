import { CardPackRepo } from 'database/repositories';
import type { Context } from 'elysia';
import type { GetCardPacksDto } from 'shared';

export const getAllCardPacks = async ({
    query: { page, take },
    set,
}: Pick<Context, 'set'> & {
    query: GetCardPacksDto;
}) => {
    const { items, total } = await CardPackRepo.findAll(page, take);

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
