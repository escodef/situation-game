import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import { type Static, t } from 'elysia';

export const EnvSchema = t.Object({
    NODE_ENV: t.Union([t.Literal('development'), t.Literal('production'), t.Literal('test')], {
        default: 'development',
    }),
    PORT: t.Numeric({ default: 3000 }),
    OPENAPI_PATH: t.String({ default: '/swagger' }),

    DATABASE_URL: t.String({ minLength: 1 }),
    VALKEY_URL: t.String({ minLength: 1 }),

    JWT_ACCESS_SECRET: t.String({ minLength: 1 }),
    JWT_REFRESH_SECRET: t.String({ minLength: 1 }),
    JWT_ACCESS_EXPIRES_IN: t.Numeric({ default: 900 }),
    JWT_REFRESH_EXPIRES_IN: t.Numeric({ default: 604800 }),

    S3_ENDPOINT: t.String({ minLength: 1 }),
    S3_ACCESS_KEY_ID: t.String({ minLength: 1 }),
    S3_SECRET_ACCESS_KEY: t.String({ minLength: 1 }),
    S3_REGION: t.String({ default: 'us-east-1' }),
    S3_BUCKET_NAME: t.String({ minLength: 1 }),

    ADMIN_EMAIL: t.String({ format: 'email' }),
    ADMIN_PASSWORD: t.String({ minLength: 8 }),
    ADMIN_NICKNAME: t.String({ minLength: 3 }),

    SENTRY_DSN: t.Optional(t.String()),
});

export type Env = Static<typeof EnvSchema>;

const compiledSchema = TypeCompiler.Compile(EnvSchema);

function validateEnv(): Env {
    const prepared = Value.Parse(
        ['Clone', 'Clean', 'Default', 'Decode', 'Convert'],
        EnvSchema,
        Bun.env,
    );

    if (!compiledSchema.Check(prepared)) {
        const formattedErrors = [...compiledSchema.Errors(prepared)]
            .map((err) => {
                const property = err.path.replace(/^\//, '');
                return `[${property}]: ${err.message}`;
            })
            .join('\n');

        console.error(`\nОшибка валидации переменных окружения (.env):\n${formattedErrors}\n`);
        process.exit(1);
    }

    return prepared as Env;
}

export const env: Env = validateEnv();
