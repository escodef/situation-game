import openapi from '@elysiajs/openapi';
import Elysia from 'elysia';
import { getOrThrow } from 'shared';

export const openApiPlugin = new Elysia().use(
    openapi({
        path: getOrThrow(Bun.env.OPENAPI_PATH),
        exclude: { paths: ['/*', ''] },
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
