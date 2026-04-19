import { Queue } from 'bullmq';
import { valkeyConnection } from 'database';

export const gameQueue = new Queue('game-loop', { connection: valkeyConnection });
