import Elysia from 'elysia';
import { authenticate } from 'src/shared';
import { createSituationPack } from '../controllers/situation-pack/create.controller';

export const situationpack = new Elysia({ prefix: '/situation-pack' })
    .use(authenticate)
    .post('/create', ({ request, user }) => createSituationPack(request, user));
