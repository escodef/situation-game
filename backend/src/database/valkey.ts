import { Redis } from 'ioredis';
import { getOrThrow } from 'shared';

const valkeyUrl = getOrThrow(Bun.env.VALKEY_URL);

export const valkeyConnection = new Redis(valkeyUrl, {
    maxRetriesPerRequest: null,
});

export const valkeySubscriber = new Redis(valkeyUrl, {
    maxRetriesPerRequest: null,
});

valkeyConnection.on('error', (err) => console.error('Redis Connection Error:', err));
valkeySubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
