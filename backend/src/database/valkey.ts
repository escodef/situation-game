import { Redis } from 'ioredis';
import { env } from 'shared';

const valkeyUrl = env.VALKEY_URL;

export const valkeyConnection = new Redis(valkeyUrl, {
    maxRetriesPerRequest: null,
});

export const valkeySubscriber = new Redis(valkeyUrl, {
    maxRetriesPerRequest: null,
});

valkeyConnection.on('error', (err) => console.error('Redis Connection Error:', err));
valkeySubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
