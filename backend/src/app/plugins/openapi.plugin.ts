import openapi from '@elysiajs/openapi';
import Elysia from 'elysia';
import { env } from 'shared';

export const openApiPlugin = new Elysia().use(
    openapi({
        path: env.OPENAPI_PATH,
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
