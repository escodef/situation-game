import { sendToGameRoom, sendToUser } from 'app/socket/websocket.manager';
import { inspect } from 'bun';
import {
    db,
    GameRepo,
    GameRoundRepo,
    PlayerHandRepo,
    PlayerMoveRepo,
    SituationPackRepo,
    UserRepo,
    VoteRepo,
} from 'database';
import { gameQueue } from 'queue';
import { EGameJob, EGameStatus, ERoundStatus, ESocketOutcomeEvent } from 'shared';

export const GameLoopService = {
    async finishPicking(gameId: string, roundId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const updateRes = await client.query(
                'UPDATE "game_rounds" SET status = $1 WHERE id = $2 AND status = $3 RETURNING id',
                [ERoundStatus.VOTING, roundId, ERoundStatus.PICKING],
            );

            if (updateRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return;
            }

            await PlayerMoveRepo.forceRandomMoves(roundId, client);

            const moves = await PlayerMoveRepo.getMovesWithCards(roundId, client);

            sendToGameRoom(gameId, {
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

            const updateRes = await client.query(
                'UPDATE "game_rounds" SET status = $1 WHERE id = $2 AND status = $3 RETURNING id',
                [ERoundStatus.FINISHED, roundId, ERoundStatus.VOTING],
            );

            if (updateRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return;
            }

            const round = await GameRoundRepo.findById(roundId, client);
            const game = await GameRepo.findOne(gameId, client);
            if (!game || !round) throw new Error('Not found');

            const votes = await VoteRepo.findByRound(roundId, client);
            const voteCounts: Record<string, number> = {};
            votes.forEach((v) => {
                voteCounts[v.targetUserId] = (voteCounts[v.targetUserId] || 0) + 1;
            });

            let maxVotes = 0;
            for (const count of Object.values(voteCounts)) {
                if (count > maxVotes) maxVotes = count;
            }

            const winnerIds: string[] = [];
            if (maxVotes > 0) {
                for (const [uId, count] of Object.entries(voteCounts)) {
                    if (count === maxVotes) winnerIds.push(uId);
                }
            }

            for (const wId of winnerIds) {
                await UserRepo.incrementScore(wId, 1, client);
            }

            const players = await UserRepo.getPlayersByGameId(gameId, client);

            sendToGameRoom(gameId, {
                event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                data: {
                    status: ERoundStatus.FINISHED,
                    winnerIds,
                    winnerId: winnerIds[0] || null,
                    players,
                },
            });

            if (round.roundNumber >= game.maxRounds) {
                await GameRepo.updateStatus(gameId, EGameStatus.FINISHED, client);

                await PlayerHandRepo.clearAllGameData(gameId, client);

                sendToGameRoom(gameId, {
                    event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                    data: {
                        status: EGameStatus.FINISHED,
                        finalScores: players.sort((a, b) => b.score - a.score),
                    },
                });
                await client.query('COMMIT');
                return;
            }

            await client.query('COMMIT');
            await this.scheduleStartNextRound(gameId, roundId, 5000);
        } catch (error) {
            console.error('finishVoting Error:', inspect(error));
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    },

    async startNextRound(gameId: string, lastRoundId?: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            let lastRound: Awaited<ReturnType<typeof GameRoundRepo.findById>>;
            if (lastRoundId) {
                lastRound = await GameRoundRepo.findById(lastRoundId, client);
            }
            const situation = await SituationPackRepo.getRandomForGame(gameId, client);

            if (!situation) {
                await GameRepo.updateStatus(gameId, EGameStatus.FINISHED, client);
                await PlayerHandRepo.clearAllGameData(gameId, client);
                sendToGameRoom(gameId, {
                    event: ESocketOutcomeEvent.ERROR,
                    data: 'Ситуации закончились. Игра завершена.',
                });
                await client.query('COMMIT');
                return;
            }

            await PlayerHandRepo.ensureHandFilled(gameId, client);

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

            sendToGameRoom(gameId, {
                event: ESocketOutcomeEvent.GAME_STARTED,
                data: {
                    roundId: nextRound.id,
                    situationText: situation.text,
                    endsAt: endsAt.toISOString(),
                },
            });

            const players = await UserRepo.getPlayersByGameId(gameId, client);
            for (const player of players) {
                const hand = await PlayerHandRepo.getHand(player.id, gameId, client);

                sendToUser(player.id, {
                    event: ESocketOutcomeEvent.ROUND_STAGE_CHANGED,
                    data: {
                        status: ERoundStatus.PICKING,
                        hand: hand,
                    },
                });
            }

            await this.schedulePickingEnd(gameId, nextRound.id, 60000);
            await client.query('COMMIT');
        } catch (error) {
            console.error('startNextRound Error:', inspect(error));
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

    async scheduleStartNextRound(gameId: string, roundId: string, delayMs: number = 5000) {
        await gameQueue.add(
            EGameJob.START_NEXT_ROUND,
            { gameId, roundId },
            { delay: delayMs, jobId: `next_round:${roundId}` },
        );
    },
};
