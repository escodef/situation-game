import openapi, { fromTypes } from '@elysiajs/openapi';
import Elysia from 'elysia';
import { join } from 'node:path';

export const openApi = new Elysia().use(
    openapi({
        path: Bun.env.OPENAPI_PATH ?? '/openapi',
        exclude: { paths: ['/*', ''] },
        references: fromTypes('src/index.ts', {
            projectRoot: join(import.meta.dir, '../../..'),
        }),
        documentation: {
            info: { title: 'Situation Game API', version: '1.0.0' },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    }),
);
