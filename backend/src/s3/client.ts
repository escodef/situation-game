import { S3Client } from '@aws-sdk/client-s3';
import { getOrThrow } from 'shared';

export const s3Client = new S3Client({
    endpoint: getOrThrow(Bun.env.S3_ENDPOINT),
    credentials: {
        accessKeyId: getOrThrow(Bun.env.S3_ACCESS_KEY_ID),
        secretAccessKey: getOrThrow(Bun.env.S3_SECRET_ACCESS_KEY),
    },
    region: getOrThrow(Bun.env.S3_REGION),
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNTE0M2Q0MC01ZTZlLTQ0MmYtYjRjMC05ZmQxMjI4NzE4NmMiLCJpYXQiOjE3NzY2OTk2MjEsImV4cCI6MTc3NjcwMTQyMX0.FAVhrC6ilx-otLSYnzHMtntK7URBHqniKq-cBFObTLQ

    forcePathStyle: true,
});
