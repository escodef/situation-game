import { SituationPackRepo } from 'src/database/repositories';
import { CreateSituationPackDto, TokenPayload } from 'src/shared';

export const createSituationPack = async ({
    body,
    user,
    set,
}: {
    body: CreateSituationPackDto;
    user: TokenPayload;
    set: any;
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
