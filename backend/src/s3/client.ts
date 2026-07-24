import { S3Client } from '@aws-sdk/client-s3';
import { getOrThrow } from 'shared';

export const s3Client = new S3Client({
    endpoint: getOrThrow(Bun.env.S3_ENDPOINT),
    credentials: {
        accessKeyId: getOrThrow(Bun.env.S3_ACCESS_KEY_ID),
        secretAccessKey: getOrThrow(Bun.env.S3_SECRET_ACCESS_KEY),
    },
    region: getOrThrow(Bun.env.S3_REGION),

    forcePathStyle: true,
});
