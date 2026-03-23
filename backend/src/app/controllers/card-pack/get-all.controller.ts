import { CardPackRepo } from 'src/database/repositories';
import type { GetCardPacksDto } from 'src/shared';

export const getAllCardPacks = async ({
    query: { page, take },
    set,
}: {
    query: GetCardPacksDto;
    set: any;
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
