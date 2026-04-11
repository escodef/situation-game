import openapi, { fromTypes } from '@elysiajs/openapi';
import Elysia from 'elysia';

export const openApi = new Elysia().use(
    openapi({
        references: fromTypes(),
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
