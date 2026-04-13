import { Worker } from 'bullmq';
import { valkeyConnection } from 'database/valkey';
import { EGameJob } from 'shared';
import { GameLoopService } from '../services/game-loop.service';

export const gameWorker = new Worker(
    'game-loop',
    async (job) => {
        const { gameId, roundId } = job.data;

        switch (job.name) {
            case EGameJob.END_PICKING:
                await GameLoopService.finishPicking(gameId, roundId);
                break;
            case EGameJob.END_VOTING:
                await GameLoopService.finishVoting(gameId, roundId);
                break;
        }
    },
    { connection: valkeyConnection },
);
