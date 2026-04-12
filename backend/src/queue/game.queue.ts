import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(Bun.env.VALKEY_URL || 'redis://localhost:6379');

export const gameQueue = new Queue('game-loop', { connection });
