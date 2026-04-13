import { Queue } from 'bullmq';
import { valkeyConnection } from 'database/valkey';

export const gameQueue = new Queue('game-loop', { connection: valkeyConnection });
