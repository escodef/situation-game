import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { socket } from '@/api/socket';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
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
  const authStore = useAuthStore();
  const toast = useToastStore();

  const game = ref<IGame | null>(null);
  const gameStatus = ref<EGameStatus>(EGameStatus.WAITING);
  const roundStatus = ref<ERoundStatus>(ERoundStatus.PICKING);
  const currentRoundId = ref<string | null>(null);
  const roundNumber = ref<number>(0);
  const currentSituation = ref<string>('');
  const endsAt = ref<Date | null>(null);

  const hand = ref<ICard[]>([]);
  const moves = ref<IPlayerMove[]>([]);
  const players = ref<{ id: string; nickname: string; score: number }[]>([]);

  const pickedUsers = ref<Set<string>>(new Set());
  const votedUsers = ref<Set<string>>(new Set());
  const hasPickedInRound = ref(false);
  const hasVotedInRound = ref(false);

  const currentWinnerIds = ref<string[]>([]);
  const finalLeaderboard = ref<{ id?: string; nickname: string; score: number }[]>([]);
  const finishReason = ref<string | null>(null);

  const isOwner = computed(() => {
    return Boolean(authStore.user?.id && game.value?.ownerId === authStore.user.id);
  });

  // Загружаем данные комнаты по HTTP, чтобы сразу знать ownerId, код и текущих игроков
  const fetchGameDetails = async (gameId: string) => {
    try {
      const { data } = await http.get(`/game/${gameId}`);
      if (data.data) {
        game.value = data.data;
        gameStatus.value = data.data.status;
        if (data.data.players) {
          players.value = data.data.players;
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Не удалось загрузить данные комнаты');
    }
  };

  const setupSocketListeners = () => {
    socket.clearHandlers();

    // 1. Восстановление состояния при реконнекте (F5)
    socket.on(ESocketOutcomeEvent.GAME_STATE, (data: any) => {
      if (data.game) {
        game.value = data.game;
        gameStatus.value = data.game.status;
        players.value = data.game.players || [];
      }
      if (data.hand) {
        hand.value = data.hand;
      }
      if (data.currentRound) {
        currentRoundId.value = data.currentRound.id;
        roundNumber.value = data.currentRound.roundNumber;
        roundStatus.value = data.currentRound.status;
        endsAt.value = data.currentRound.endsAt ? new Date(data.currentRound.endsAt) : null;
      }
      if (data.moves) {
        moves.value = data.moves;
      }
    });

    // 2. В комнату зашел игрок
    socket.on(ESocketOutcomeEvent.PLAYER_JOINED, (player) => {
      if (!players.value.some((p) => p.id === player.userId)) {
        players.value.push({
          id: player.userId,
          nickname: player.nickname,
          score: player.score ?? 0,
        });
        toast.info(`${player.nickname} влетел в комнату!`);
      }
    });

    // 3. Игрок покинул комнату
    socket.on(ESocketOutcomeEvent.PLAYER_LEFT, ({ userId }) => {
      const leaver = players.value.find((p) => p.id === userId);
      if (leaver) {
        toast.warning(`${leaver.nickname} покинул игру`);
      }
      players.value = players.value.filter((p) => p.id !== userId);
    });

    // 4. Начало нового раунда (GAME_STARTED)
    socket.on(ESocketOutcomeEvent.GAME_STARTED, (data: any) => {
      gameStatus.value = EGameStatus.STARTED;
      roundStatus.value = ERoundStatus.PICKING;
      currentRoundId.value = data.roundId;
      roundNumber.value += 1;
      currentSituation.value = data.situationText;
      endsAt.value = new Date(data.endsAt);

      pickedUsers.value = new Set();
      votedUsers.value = new Set();
      hasPickedInRound.value = false;
      hasVotedInRound.value = false;
      moves.value = [];
      currentWinnerIds.value = [];
    });

    // 5. Кто-то выбрал карту
    socket.on(ESocketOutcomeEvent.CARD_PICKED, ({ userId }) => {
      pickedUsers.value = new Set([...pickedUsers.value, userId]);
      if (userId === authStore.user?.id) {
        hasPickedInRound.value = true;
      }
    });

    // 6. Кто-то проголосовал
    socket.on(ESocketOutcomeEvent.PLAYER_VOTED, ({ voterId }) => {
      votedUsers.value = new Set([...votedUsers.value, voterId]);
      if (voterId === authStore.user?.id) {
        hasVotedInRound.value = true;
      }
    });

    // 7. Смена стадии раунда / игры
    socket.on(ESocketOutcomeEvent.ROUND_STAGE_CHANGED, (data: any) => {
      // Пришли новые карты на руку в начале PICKING
      if (data.hand) {
        hand.value = data.hand;
      }

      // Переход к голосованию (30 секунд по документации)
      if (data.status === ERoundStatus.VOTING && data.moves) {
        roundStatus.value = ERoundStatus.VOTING;
        moves.value = data.moves;
        endsAt.value = new Date(Date.now() + 30000);
        return;
      }

      // Финал всей игры (пришли finalScores или причина досрочного завершения)
      if (data.finalScores || data.reason) {
        gameStatus.value = EGameStatus.FINISHED;
        endsAt.value = null;
        if (data.finalScores) {
          finalLeaderboard.value = data.finalScores;
        }
        if (data.reason) {
          finishReason.value = data.reason;
          toast.warning(data.reason);
        }
        confetti({ particleCount: 160, spread: 110, origin: { y: 0.5 } });
        return;
      }

      // Итоги одного раунда (5 секунд перерыва перед следующим)
      if (data.status === ERoundStatus.FINISHED) {
        roundStatus.value = ERoundStatus.FINISHED;
        endsAt.value = new Date(Date.now() + 5000);
        if (data.winnerIds) currentWinnerIds.value = data.winnerIds;
        if (data.players) players.value = data.players;
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
      }
    });

    // 8. Ошибки сокета
    socket.on(ESocketOutcomeEvent.ERROR, (msg) => {
      const text = typeof msg === 'string' ? msg : 'Ошибка игрового сервера';
      toast.error(text);
    });
  };

  const joinGame = async (gameId: string) => {
    roundNumber.value = 0;
    finalLeaderboard.value = [];
    finishReason.value = null;
    await fetchGameDetails(gameId);
    socket.send(ESocketIncomeEvent.JOIN_GAME, { gameId });
  };

  const startGame = () => {
    if (players.value.length < 2) {
      toast.warning('Для старта нужно минимум 2 игрока!');
      return;
    }
    socket.send(ESocketIncomeEvent.START_GAME);
  };

  const pickCard = (cardId: string) => {
    if (!currentRoundId.value) {
      toast.error('Раунд еще не активен');
      return;
    }
    if (hasPickedInRound.value) {
      toast.warning('Ты уже скинул карту в этом раунде!');
      return;
    }
    socket.send(ESocketIncomeEvent.PICK_CARD, {
      cardId,
      roundId: currentRoundId.value,
    });
    hasPickedInRound.value = true;
    hand.value = hand.value.filter((c) => c.id !== cardId);
  };

  const voteForPlayer = (targetUserId: string) => {
    if (targetUserId === authStore.user?.id) {
      toast.warning('За самого себя голосовать нельзя!');
      return;
    }
    if (hasVotedInRound.value) {
      toast.warning('Ты уже отдал свой голос!');
      return;
    }
    socket.send(ESocketIncomeEvent.VOTE, { targetUserId });
    hasVotedInRound.value = true;
    toast.success('Голос засчитан!');
  };

  const leaveGame = () => {
    socket.send(ESocketIncomeEvent.LEAVE_GAME);
    game.value = null;
    gameStatus.value = EGameStatus.WAITING;
  };

  return {
    game,
    gameStatus,
    roundNumber,
    roundStatus,
    currentRoundId,
    currentSituation,
    endsAt,
    hand,
    moves,
    players,
    pickedUsers,
    votedUsers,
    hasPickedInRound,
    hasVotedInRound,
    currentWinnerIds,
    finalLeaderboard,
    finishReason,
    isOwner,
    setupSocketListeners,
    joinGame,
    startGame,
    pickCard,
    voteForPlayer,
    leaveGame,
  };
});