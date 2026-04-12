// backend/src/services/game-loop.service.ts

import { websocketInstance } from 'app/socket/websocket.manager';
import { db } from 'database/data-source';
import {
    GameRoundRepo,
    PlayerMoveRepo,
    SituationPackRepo,
    UserRepo,
    VoteRepo,
} from 'database/repositories';
import { gameQueue } from 'queue/game.queue';
import { EGameJob, ERoundStatus, ESocketOutcomeEvent } from 'shared';

export const GameLoopService = {
    async finishPicking(gameId: string, roundId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const round = await GameRoundRepo.findById(roundId, client);
            if (!round || round.status !== ERoundStatus.PICKING) return;

            await PlayerMoveRepo.forceRandomMoves(roundId, client);
            await GameRoundRepo.updateStatus(roundId, ERoundStatus.VOTING, client);

            const moves = await PlayerMoveRepo.getMovesWithCards(roundId, client);

            websocketInstance.sendToGameRoom(gameId, {
                event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                data: {
                    status: ERoundStatus.VOTING,
                    moves: moves,
                },
            });

            await this.scheduleVotingEnd(gameId, roundId, 30000);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('finishPicking Error:', e);
        } finally {
            client.release();
        }
    },

    async finishVoting(gameId: string, roundId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const votes = await VoteRepo.findByRound(roundId, client);

            const voteCounts: Record<string, number> = {};
            votes.forEach((v) => {
                voteCounts[v.targetUserId] = (voteCounts[v.targetUserId] || 0) + 1;
            });

            let winnerId = null;
            let maxVotes = 0;
            for (const [userId, count] of Object.entries(voteCounts)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    winnerId = userId;
                }
            }

            if (winnerId) {
                await UserRepo.incrementScore(winnerId, 1, client);
            }

            await GameRoundRepo.updateStatus(roundId, ERoundStatus.FINISHED, client);

            const players = await UserRepo.getPlayersByGameId(gameId, client);

            websocketInstance.sendToGameRoom(gameId, {
                event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                data: {
                    status: ERoundStatus.FINISHED,
                    winnerId,
                    players,
                },
            });

            setTimeout(() => this.startNextRound(gameId, roundId), 5000);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('finishVoting Error:', e);
        } finally {
            client.release();
        }
    },

    async startNextRound(gameId: string, lastRoundId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const lastRound = await GameRoundRepo.findById(lastRoundId, client);
            const situation = await SituationPackRepo.getRandomForGame(gameId, client);

            if (!situation) {
                websocketInstance.sendToGameRoom(gameId, {
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Игра окончена! Ситуации закончились.',
                });
                return;
            }

            const endsAt = new Date(Date.now() + 60000);
            const nextRound = await GameRoundRepo.create(
                {
                    gameId,
                    roundNumber: (lastRound?.roundNumber || 0) + 1,
                    situationId: situation.id,
                    endsAt,
                },
                client,
            );

            websocketInstance.sendToGameRoom(gameId, {
                event: ESocketOutcomeEvent.GAME_STARTED,
                data: {
                    roundId: nextRound.id,
                    situationText: situation.text,
                    endsAt: endsAt.toISOString(),
                },
            });

            await this.schedulePickingEnd(gameId, nextRound.id, 60000);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    },

    async schedulePickingEnd(gameId: string, roundId: string, delayMs: number) {
        await gameQueue.add(
            EGameJob.END_PICKING,
            { gameId, roundId },
            { delay: delayMs, jobId: `picking:${roundId}` },
        );
    },

    async scheduleVotingEnd(gameId: string, roundId: string, delayMs: number = 30000) {
        await gameQueue.add(
            EGameJob.END_VOTING,
            { gameId, roundId },
            { delay: delayMs, jobId: `voting:${roundId}` },
        );
    },
};
