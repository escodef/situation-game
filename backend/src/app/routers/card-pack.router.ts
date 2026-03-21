import Elysia from 'elysia';
import { authenticate } from 'src/shared';
import { createCardPack } from '../controllers/card-pack/create.controller';

export const cardpack = new Elysia({ prefix: '/card-pack' })
    .use(authenticate)
    .post('/create', ({ request, user }) => createCardPack(request, user));
