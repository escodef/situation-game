import { SituationPackRepo } from 'src/database/repositories';
import type { GetSituationPacksDto } from 'src/shared';

export const getAllSituationPacks = async ({
    query: { page, take },
    set,
}: {
    query: GetSituationPacksDto;
    set: any;
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
