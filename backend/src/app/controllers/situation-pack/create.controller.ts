import { SituationPackRepo } from 'src/database/repositories';

export const createSituationPack = async ({
    body,
    user,
    set,
}: {
    body: any;
    user: any;
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
