import { GameRepo } from 'database/repositories';
import { NotFoundError } from 'elysia';
import type { GetGameByIdDto } from 'shared';

export const getGameById = async ({ params: { id } }: { params: GetGameByIdDto }) => {
    const game = await GameRepo.findOne(id);
    if (!game) throw new NotFoundError('Игра не найдена');

    return {
        success: true,
        data: game,
    };
};
