import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './client';

const Bucket = process.env.S3_BUCKET_NAME;
export async function uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
    const command = new PutObjectCommand({
        Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return await s3Client.send(command);
}

export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });
    return await s3Client.send(command);
}
