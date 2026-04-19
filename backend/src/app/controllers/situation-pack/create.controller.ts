import { db, SituationPackRepo } from 'database';
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

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const resp = await SituationPackRepo.createWithSituations(
            {
                name,
                situations,
                creatorId: user.userId,
            },
            client,
        );

        set.status = 201;
        await client.query('COMMIT');

        return {
            success: true,
            situationPackId: resp.id,
        };
    } catch {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
};
