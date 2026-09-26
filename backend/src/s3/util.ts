import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from 'shared';
import { s3Client } from './client';

const Bucket = env.S3_BUCKET_NAME;
const Endpoint = env.S3_ENDPOINT;

export async function uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
    const command = new PutObjectCommand({
        Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await s3Client.send(command);

    const baseEndpoint = Endpoint?.endsWith('/') ? Endpoint.slice(0, -1) : Endpoint;

    return `${baseEndpoint}/${Bucket}/${key}`;
}
export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket,
        Key: key,
    });
    return await s3Client.send(command);
}
