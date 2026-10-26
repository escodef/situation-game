import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { socket } from '@/api/socket';
import {
  EGameStatus,
  ERoundStatus,
  ESocketIncomeEvent,
  ESocketOutcomeEvent,
  type ICard,
  type IGame,
  type IPlayerMove,
} from '@/types';
import confetti from 'canvas-confetti';

export const useGameStore = defineStore('game', () => {
  const game = ref<IGame | null>(null);
  const roundNumber = ref<number>(1);
  const roundStatus = ref<ERoundStatus | EGameStatus>(ERoundStatus.PICKING);
  const currentSituation = ref<string>('');
  const endsAt = ref<Date | null>(null);
  const hand = ref<ICard[]>([]);
  const moves = ref<IPlayerMove[]>([]);
  const players = ref<{ id: string; nickname: string; score: number }[]>([]);
  const pickedUsers = ref<Set<string>>(new Set());
  const votedUsers = ref<Set<string>>(new Set());
  const currentWinnerIds = ref<string[]>([]);
  const finalLeaderboard = ref<{ nickname: string; score: number }[]>([]);
  const errorMessage = ref<string | null>(null);

  const isOwner = computed(() => {
    const myId = localStorage.getItem('user_id');
    return game.value?.ownerId === myId;
  });

  const setupSocketListeners = () => {
    // 1. Начальное или восстановленное состояние игры
    socket.on(ESocketOutcomeEvent.GAME_STATE, (data: any) => {
      if (data.game) {
        game.value = data.game;
        players.value = data.game.players || [];
      }
      if (data.hand) hand.value = data.hand;
      if (data.currentRound) {
        roundNumber.value = data.currentRound.roundNumber;
        roundStatus.value = data.currentRound.status;
        endsAt.value = new Date(data.currentRound.endsAt);
        if (data.currentRound.situation) {
          currentSituation.value = data.currentRound.situation.text;
        }
      }
      if (data.moves) moves.value = data.moves;
    });

    // 2. Игрок зашел
    socket.on(ESocketOutcomeEvent.PLAYER_JOINED, (player) => {
      if (!players.value.some((p) => p.id === player.userId)) {
        players.value.push({
          id: player.userId,
          nickname: player.nickname,
          score: player.score,
        });
      }
    });

    // 3. Игрок вышел
    socket.on(ESocketOutcomeEvent.PLAYER_LEFT, ({ userId }) => {
      players.value = players.value.filter((p) => p.id !== userId);
    });

    // 4. Игра началась
    socket.on(ESocketOutcomeEvent.GAME_STARTED, (data: any) => {
      roundStatus.value = ERoundStatus.PICKING;
      currentSituation.value = data.situationText;
      endsAt.value = new Date(data.endsAt);
      pickedUsers.value.clear();
      votedUsers.value.clear();
      moves.value = [];
      currentWinnerIds.value = [];
    });

    // 5. Кто-то скинул мем
    socket.on(ESocketOutcomeEvent.CARD_PICKED, ({ userId }) => {
      pickedUsers.value.add(userId);
    });

    // 6. Кто-то проголосовал
    socket.on(ESocketOutcomeEvent.PLAYER_VOTED, ({ voterId }) => {
      votedUsers.value.add(voterId);
    });

    // 7. Смена фазы раунда
    socket.on(ESocketOutcomeEvent.ROUND_STAGE_CHANGED, (data: any) => {
      if (data.status) {
        roundStatus.value = data.status;
      }
      if (data.hand) {
        hand.value = data.hand;
      }
      if (data.moves) {
        moves.value = data.moves;
      }
      if (data.status === ERoundStatus.FINISHED) {
        if (data.winnerIds) currentWinnerIds.value = data.winnerIds;
        if (data.players) players.value = data.players;
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
      if (data.finalScores) {
        finalLeaderboard.value = data.finalScores;
        roundStatus.value = EGameStatus.FINISHED;
        confetti({ particleCount: 150, spread: 100 });
      }
    });

    // 8. Ошибки
    socket.on(ESocketOutcomeEvent.ERROR, (msg) => {
      errorMessage.value = typeof msg === 'string' ? msg : 'Произошла ошибка';
      setTimeout(() => (errorMessage.value = null), 4000);
    });
  };

  const joinGame = (gameId: string) => {
    socket.send(ESocketIncomeEvent.JOIN_GAME, { gameId });
  };

  const startGame = () => {
    socket.send(ESocketIncomeEvent.START_GAME);
  };

  const pickCard = (cardId: string, roundId: string) => {
    socket.send(ESocketIncomeEvent.PICK_CARD, { cardId, roundId });
    hand.value = hand.value.filter((c) => c.id !== cardId);
  };

  const voteForPlayer = (targetUserId: string) => {
    socket.send(ESocketIncomeEvent.VOTE, { targetUserId });
  };

  const leaveGame = () => {
    socket.send(ESocketIncomeEvent.LEAVE_GAME);
    game.value = null;
  };

  return {
    game,
    roundNumber,
    roundStatus,
    currentSituation,
    endsAt,
    hand,
    moves,
    players,
    pickedUsers,
    votedUsers,
    currentWinnerIds,
    finalLeaderboard,
    errorMessage,
    isOwner,
    setupSocketListeners,
    joinGame,
    startGame,
    pickCard,
    voteForPlayer,
    leaveGame,
  };
});