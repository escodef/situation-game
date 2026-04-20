import cors from '@elysiajs/cors';
import Elysia from 'elysia';

export const corsPlugin = new Elysia().use(
    cors({
        origin: true,
        methods: ['GET', 'POST'],
        allowedHeaders: '*',
        preflight: true,
    }),
);
