<template>
  <div class="min-h-screen bg-neo-bg flex flex-col p-4 md:p-6 select-none relative overflow-x-hidden">
    <!-- Верхняя панель: Инфо раунда, код комнаты, таймер -->
    <header class="flex flex-wrap items-center justify-between gap-4 neo-box p-4 bg-white mb-6">
      <div class="flex items-center gap-3">
        <span class="bg-neo-yellow border-3 border-black px-3 py-1 font-black text-lg rounded-lg shadow-neo-sm">
          РАУНД {{ gameStore.roundNumber }} / {{ gameStore.game?.maxRounds || '?' }}
        </span>
        <div class="flex items-center gap-1 font-bold text-sm bg-neo-cyan px-2 py-1 border-2 border-black rounded-md">
          КОД: <span class="tracking-widest uppercase font-black">{{ gameStore.game?.code }}</span>
        </div>
      </div>

      <!-- Таймер -->
      <div v-if="timeLeft !== null" class="flex items-center gap-2 bg-neo-pink text-white border-3 border-black px-4 py-1.5 rounded-lg shadow-neo-sm font-black text-xl animate-pulse">
        <Clock :size="22" />
        {{ timeLeft }}с
      </div>

      <div class="flex items-center gap-3">
        <button @click="onLeave" class="neo-btn bg-white hover:bg-red-400 text-sm py-1.5">
          <LogOut :size="16" /> Выйти
        </button>
      </div>
    </header>

    <!-- Оповещение об ошибке -->
    <div v-if="gameStore.errorMessage" class="fixed top-20 right-6 z-50 bg-neo-pink text-white font-black p-4 border-4 border-black shadow-neo-lg rounded-xl animate-bounce">
      ⚠️ {{ gameStore.errorMessage }}
    </div>

    <!-- Основная сцена -->
    <main class="flex-1 flex flex-col items-center justify-between max-w-6xl mx-auto w-full gap-6">

      <!-- 1. СИТУАЦИЯ НА СТОЛЕ -->
      <section class="w-full">
        <div class="neo-box p-6 md:p-8 bg-neo-yellow text-center relative transform -rotate-1 shadow-neo-lg">
          <div class="absolute -top-4 -left-3 bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-wider rounded border-2 border-white">
            Ситуация
          </div>
          <h1 class="text-2xl md:text-4xl font-black leading-tight tracking-tight">
            {{ gameStore.currentSituation || 'Ожидаем запуска игры...' }}
          </h1>
        </div>
      </section>

      <!-- 2. ИГРОВОЙ СТОЛ (В зависимости от фазы) -->
      
      <!-- ФАЗА: ОЖИДАНИЕ В ЛОББИ -->
      <div v-if="gameStore.roundStatus === EGameStatus.WAITING" class="neo-box p-8 bg-white w-full max-w-xl text-center flex flex-col items-center">
        <h2 class="text-2xl font-black mb-4">ЖДЕМ ИГРОКОВ В ЛОББИ</h2>
        <p class="font-bold mb-6 text-gray-700">Отправь друзьям код игры: <span class="bg-neo-cyan px-2 py-0.5 border-2 border-black rounded font-black">{{ gameStore.game?.code }}</span></p>

        <div class="grid grid-cols-2 gap-3 w-full mb-8">
          <div v-for="player in gameStore.players" :key="player.id" class="p-3 border-3 border-black rounded-lg font-black flex items-center gap-2 bg-neo-bg">
            <UserCheck :size="18" /> {{ player.nickname }}
          </div>
        </div>

        <button 
          v-if="gameStore.isOwner" 
          @click="gameStore.startGame" 
          :disabled="gameStore.players.length < 2"
          class="neo-btn bg-neo-green text-xl w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed">
          НАЧАТЬ МЯСО (СТАРТ) 🚀
        </button>
        <p v-else class="text-sm font-bold animate-pulse text-gray-600">Хост скоро запустит катку...</p>
      </div>

      <!-- ФАЗА: ВЫБОР КАРТ (PICKING) -->
      <div v-else-if="gameStore.roundStatus === ERoundStatus.PICKING" class="w-full text-center">
        <div class="inline-block bg-white border-3 border-black px-6 py-2 rounded-xl shadow-neo font-black text-lg mb-6">
          🃏 Выбери самый подходящий мем из руки внизу!
        </div>

        <!-- Статус игроков (кто уже сделал ход) -->
        <div class="flex flex-wrap justify-center gap-3">
          <div 
            v-for="player in gameStore.players" 
            :key="player.id"
            :class="gameStore.pickedUsers.has(player.id) ? 'bg-neo-green' : 'bg-gray-200'"
            class="border-3 border-black px-3 py-1 rounded-lg font-black text-sm flex items-center gap-1 shadow-neo-sm">
            <Check v-if="gameStore.pickedUsers.has(player.id)" :size="16" />
            {{ player.nickname }}
          </div>
        </div>
      </div>

      <!-- ФАЗА: ГОЛОСОВАНИЕ (VOTING) -->
      <div v-else-if="gameStore.roundStatus === ERoundStatus.VOTING" class="w-full">
        <h2 class="text-2xl font-black text-center mb-6 bg-neo-purple text-white border-3 border-black py-2 rounded-xl shadow-neo">
          🔥 ВРЕМЯ ГОЛОСОВАТЬ ЗА САМЫЙ РАЗРЫВНОЙ МЕМ!
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="move in gameStore.moves" 
            :key="move.cardId"
            class="neo-box p-2 bg-white flex flex-col justify-between hover:scale-105 transition-transform">
            <img :src="move.card?.url" alt="Мем" class="w-full h-48 md:h-64 object-cover border-2 border-black rounded-lg mb-3" />
            
            <button 
              v-if="move.userId !== authStore.user?.id"
              @click="vote(move.userId)"
              :disabled="hasVoted"
              class="neo-btn bg-neo-cyan text-sm py-2 disabled:bg-gray-300">
              👍 Этот шедевр (+1)
            </button>
            <div v-else class="text-center font-black text-xs uppercase py-2 bg-gray-100 border-2 border-black rounded-lg">
              Твоя карточка
            </div>
          </div>
        </div>
      </div>

      <!-- ФАЗА: РЕЗУЛЬТАТЫ РАУНДА (FINISHED РАУНД) -->
      <div v-else-if="gameStore.roundStatus === ERoundStatus.FINISHED" class="neo-box p-8 bg-white w-full max-w-md text-center animate-bounce">
        <h2 class="text-3xl font-black mb-2 text-neo-pink">🏆 ПОБЕДИТЕЛЬ РАУНДА!</h2>
        <div class="text-xl font-bold mb-4">
          Очки забирает: 
          <span class="bg-neo-yellow px-2 py-1 border-2 border-black rounded font-black">
            {{ getWinnerNicknames() }}
          </span>
        </div>
        <p class="font-bold text-sm text-gray-500">Следующий раунд начнется через пару секунд...</p>
      </div>

      <!-- ФАЗА: ФИНАЛ ИГРЫ (ОБЩИЙ ЗАЧЕТ) -->
      <div v-else-if="gameStore.roundStatus === EGameStatus.FINISHED" class="neo-box p-8 bg-neo-green w-full max-w-lg text-center shadow-neo-lg">
        <h1 class="text-4xl font-black mb-6">🎉 ИГРА ЗАВЕРШЕНА!</h1>
        <div class="space-y-3 mb-6">
          <div 
            v-for="(scorer, idx) in gameStore.finalLeaderboard" 
            :key="scorer.nickname"
            class="flex justify-between items-center bg-white p-3 border-3 border-black rounded-lg font-black text-lg">
            <span>#{{ idx + 1 }} {{ scorer.nickname }}</span>
            <span class="bg-neo-yellow px-3 py-0.5 border-2 border-black rounded-md">{{ scorer.score }} очков</span>
          </div>
        </div>
        <button @click="onLeave" class="neo-btn bg-white w-full py-3 text-lg">В ЛОББИ</button>
      </div>

      <!-- 3. РУКА ИГРОКА (ВНИЗУ ЭКРАНА) -->
      <footer 
        v-if="gameStore.roundStatus === ERoundStatus.PICKING && gameStore.hand.length > 0" 
        class="w-full mt-auto">
        <div class="text-xs font-black uppercase tracking-wider mb-2 text-center bg-black text-white py-1 rounded border-2 border-black">
          Твои карты на руках (нажми, чтобы бросить на стол):
        </div>
        <div class="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-2">
          <div 
            v-for="card in gameStore.hand" 
            :key="card.id"
            @click="chooseCard(card.id)"
            class="neo-box p-2 bg-white flex-shrink-0 cursor-pointer w-36 md:w-48 transform hover:-translate-y-4 hover:rotate-1 transition-all shadow-neo hover:shadow-neo-lg">
            <img :src="card.url" alt="Мем" class="w-full h-32 md:h-44 object-cover border-2 border-black rounded-md" />
            <div class="text-center font-black text-xs uppercase mt-2 bg-neo-yellow py-1 border border-black rounded">
              Бросить карту
            </div>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { EGameStatus, ERoundStatus } from '@/types';
import { Clock, LogOut, UserCheck, Check } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const authStore = useAuthStore();

const timeLeft = ref<number | null>(null);
const hasVoted = ref(false);
let timerInterval: any = null;

onMounted(() => {
  gameStore.setupSocketListeners();
  const gameId = route.params.id as string;
  gameStore.joinGame(gameId);

  timerInterval = setInterval(() => {
    if (gameStore.endsAt) {
      const diff = Math.max(0, Math.floor((new Date(gameStore.endsAt).getTime() - Date.now()) / 1000));
      timeLeft.value = diff;
    } else {
      timeLeft.value = null;
    }
  }, 500);
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const chooseCard = (cardId: string) => {
  if (!gameStore.game?.rounds?.length && !route.params.id) return;
  const currentRound = gameStore.game?.rounds?.[gameStore.game.rounds.length - 1];
  if (currentRound) {
    gameStore.pickCard(cardId, currentRound.id);
  }
};

const vote = (targetUserId: string) => {
  gameStore.voteForPlayer(targetUserId);
  hasVoted.value = true;
};

const getWinnerNicknames = () => {
  return gameStore.players
    .filter((p) => gameStore.currentWinnerIds.includes(p.id))
    .map((p) => p.nickname)
    .join(', ') || 'Ничья';
};

const onLeave = () => {
  gameStore.leaveGame();
  router.push('/');
};
</script>