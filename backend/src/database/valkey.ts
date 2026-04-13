import { Redis } from 'ioredis';

export const valkeyConnection = new Redis(Bun.env.VALKEY_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

valkeyConnection.on('error', (err) => console.error('Redis Connection Error:', err));
