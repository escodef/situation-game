import { SituationPackRepo } from 'database/repositories';
import type { Context } from 'elysia';
import type { CreateSituationPackDto, TokenPayload } from 'shared';

export const createSituationPack = async ({
    body,
    user,
    set,
}: Pick<Context, 'set'> & {
    body: CreateSituationPackDto;
    user: TokenPayload;
}) => {
    const { name, situations } = body;

    const resp = await SituationPackRepo.createWithSituations({
        name,
        situations,
        creatorId: user.userId,
    });

    set.status = 201;
    return {
        success: true,
        situationPackId: resp.id,
    };
};
