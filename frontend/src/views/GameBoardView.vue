<template>
  <div class="min-h-screen bg-neo-bg flex flex-col p-3 md:p-6 select-none relative overflow-x-hidden">
    <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
    <header class="flex flex-wrap items-center justify-between gap-3 neo-box p-3 md:p-4 bg-white mb-5">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="bg-neo-yellow border-3 border-black px-3 py-1 font-black text-base md:text-lg rounded-xl shadow-neo-sm">
          <template v-if="gameStore.gameStatus === EGameStatus.WAITING">ЛОББИ ОЖИДАНИЯ</template>
          <template v-else>РАУНД {{ gameStore.roundNumber }} / {{ gameStore.game?.maxRounds || '?' }}</template>
        </span>

        <button
          @click="copyRoomCode"
          title="Нажми, чтобы скопировать код"
          class="flex items-center gap-1.5 font-bold text-sm bg-neo-cyan px-3 py-1.5 border-3 border-black rounded-xl shadow-neo-sm hover:bg-cyan-300 active:translate-y-0.5 transition-all cursor-pointer"
        >
          КОД: <span class="tracking-widest uppercase font-black">{{ gameStore.game?.code || '...' }}</span>
          <Copy :size="14" />
        </button>
      </div>

      <!-- ТАЙМЕР -->
      <div
        v-if="timeLeft !== null && gameStore.gameStatus === EGameStatus.STARTED"
        :class="timeLeft <= 10 ? 'bg-neo-pink text-white animate-bounce' : 'bg-neo-yellow text-black'"
        class="flex items-center gap-2 border-3 border-black px-4 py-1.5 rounded-xl shadow-neo-sm font-black text-xl transition-colors"
      >
        <Clock :size="22" />
        {{ timeLeft }}с
      </div>

      <!-- КНОПКА ВЫХОДА -->
      <button @click="onLeave" class="neo-btn bg-white hover:bg-neo-pink hover:text-white text-sm py-1.5 px-3">
        <LogOut :size="16" /> Выйти
      </button>
    </header>

    <!-- ПАНЕЛЬ ИГРОКОВ И ОЧКОВ (ВСЕГДА ВИДНА ВВЕРХУ) -->
    <div v-if="gameStore.players.length > 0" class="max-w-6xl mx-auto w-full mb-5 flex flex-wrap gap-2 justify-center">
      <div
        v-for="player in gameStore.players"
        :key="player.id"
        :class="[
          player.id === authStore.user?.id ? 'ring-4 ring-neo-purple' : '',
          isPlayerReady(player.id) ? 'bg-neo-green' : 'bg-white',
        ]"
        class="border-3 border-black px-3 py-1.5 rounded-xl shadow-neo-sm flex items-center gap-2 font-black text-sm transition-all"
      >
        <span>{{ player.nickname }}</span>
        <span class="bg-neo-yellow px-2 py-0.5 border-2 border-black rounded-md text-xs">
          ★ {{ player.score ?? 0 }}
        </span>
        <span v-if="isPlayerReady(player.id)" class="text-xs bg-black text-white px-1.5 py-0.5 rounded">
          ✓
        </span>
      </div>
    </div>

    <!-- ОСНОВНАЯ СЦЕНА -->
    <main class="flex-1 flex flex-col items-center justify-between max-w-6xl mx-auto w-full gap-6">
      <!-- 1. СИТУАЦИЯ НА СТОЛЕ (Показываем, когда игра идет) -->
      <Transition name="pop" mode="out-in">
        <section v-if="gameStore.gameStatus === EGameStatus.STARTED" :key="gameStore.currentSituation" class="w-full">
          <div class="neo-box p-6 md:p-8 bg-neo-yellow text-center relative transform -rotate-1 shadow-neo-lg">
            <div class="absolute -top-3.5 left-4 bg-black text-white px-3 py-0.5 font-black text-xs uppercase tracking-wider rounded border-2 border-white">
              Ситуация раунда #{{ gameStore.roundNumber }}
            </div>
            <h1 class="text-xl md:text-3xl font-black leading-snug tracking-tight">
              {{ gameStore.currentSituation || 'Загружаем ситуацию...' }}
            </h1>
          </div>
        </section>
      </Transition>

      <!-- 2. ИГРОВОЙ СТОЛ ПО ФАЗАМ -->
      <Transition name="pop" mode="out-in">
        <!-- ФАЗА 1: ОЖИДАНИЕ ИГРОКОВ В ЛОББИ -->
        <div
          v-if="gameStore.gameStatus === EGameStatus.WAITING"
          key="waiting"
          class="neo-box p-8 bg-white w-full max-w-xl text-center flex flex-col items-center my-auto shadow-neo-lg"
        >
          <div class="bg-neo-cyan border-3 border-black px-4 py-1 rounded-full font-black text-xs uppercase mb-3 shadow-neo-sm">
            Комната готова
          </div>
          <h2 class="text-3xl font-black mb-2">СОБИРАЕМ БАНДУ</h2>
          <p class="font-bold mb-6 text-gray-600 text-sm">
            Скинь друзьям код комнаты (кликни, чтобы скопировать):
          </p>

          <div
            @click="copyRoomCode"
            class="bg-neo-yellow border-4 border-black px-8 py-3 rounded-2xl font-mono font-black text-4xl tracking-widest shadow-neo mb-6 cursor-pointer hover:scale-105 transition-transform"
          >
            {{ gameStore.game?.code }}
          </div>

          <div class="w-full text-left mb-2 font-black text-xs uppercase text-gray-500">
            Игроки в комнате ({{ gameStore.players.length }} / {{ gameStore.game?.maxPlayers || '?' }}):
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
            <div
              v-for="player in gameStore.players"
              :key="player.id"
              class="p-3 border-3 border-black rounded-xl font-black flex items-center justify-between bg-neo-bg shadow-neo-sm"
            >
              <span class="flex items-center gap-2 truncate">
                <UserCheck :size="18" /> {{ player.nickname }}
              </span>
              <span v-if="player.id === gameStore.game?.ownerId" class="text-xs bg-neo-pink text-white px-2 py-0.5 border border-black rounded">
                ХОСТ
              </span>
            </div>
          </div>

          <button
            v-if="gameStore.isOwner"
            @click="gameStore.startGame"
            :disabled="gameStore.players.length < 2"
            class="neo-btn bg-neo-green text-xl w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed neo-box-hover"
          >
            {{ gameStore.players.length < 2 ? 'ЖДЕМ МИНИМУМ 2 ИГРОКОВ...' : 'НАЧАТЬ МЯСО (СТАРТ) 🚀' }}
          </button>
          <div v-else class="p-4 border-3 border-dashed border-black rounded-xl w-full bg-neo-bg font-black text-sm animate-pulse">
            ⏳ Ждем, когда создатель комнаты запустит игру...
          </div>
        </div>

        <!-- ФАЗА 2: ВЫБОР КАРТ (PICKING) -->
        <div
          v-else-if="gameStore.gameStatus === EGameStatus.STARTED && gameStore.roundStatus === ERoundStatus.PICKING"
          key="picking"
          class="w-full text-center my-4"
        >
          <div
            v-if="!gameStore.hasPickedInRound"
            class="inline-block bg-white border-4 border-black px-6 py-4 rounded-2xl shadow-neo font-black text-lg md:text-xl"
          >
            👇 Выбери самый угарный мем из своей руки внизу!
          </div>
          <div
            v-else
            class="inline-block bg-neo-green border-4 border-black px-8 py-5 rounded-2xl shadow-neo-lg font-black text-xl animate-pulse"
          >
            ✅ Твой мем на столе! Ждем остальных задумчивых игроков...
          </div>
        </div>

        <!-- ФАЗА 3: ГОЛОСОВАНИЕ (VOTING) -->
        <div
          v-else-if="gameStore.gameStatus === EGameStatus.STARTED && gameStore.roundStatus === ERoundStatus.VOTING"
          key="voting"
          class="w-full"
        >
          <div class="text-center mb-5">
            <span class="inline-block bg-neo-purple text-white border-3 border-black px-6 py-2 rounded-xl shadow-neo font-black text-lg md:text-xl">
              🔥 ГОЛОСУЙ ЗА ЛУЧШИЙ МЕМ РАУНДА!
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div
              v-for="move in gameStore.moves"
              :key="move.cardId"
              class="neo-box p-3 bg-white flex flex-col justify-between hover:-translate-y-1 transition-transform"
            >
              <div class="relative group mb-3">
                <img
                  :src="move.card?.url"
                  alt="Мем"
                  @click="zoomedImage = move.card?.url || null"
                  class="w-full h-56 object-contain bg-neo-bg border-3 border-black rounded-xl cursor-zoom-in"
                />
                <button
                  @click="zoomedImage = move.card?.url || null"
                  class="absolute top-2 right-2 bg-white border-2 border-black p-1.5 rounded-lg opacity-80 hover:opacity-100"
                  title="Увеличить"
                >
                  🔍
                </button>
              </div>

              <button
                v-if="move.userId !== authStore.user?.id"
                @click="gameStore.voteForPlayer(move.userId)"
                :disabled="gameStore.hasVotedInRound"
                class="neo-btn bg-neo-cyan text-sm py-2.5 w-full disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {{ gameStore.hasVotedInRound ? 'Голос принят' : '👍 Голосовать (+1)' }}
              </button>
              <div
                v-else
                class="text-center font-black text-xs uppercase py-2.5 bg-neo-yellow border-3 border-black rounded-xl"
              >
                😎 Это твой мем
              </div>
            </div>
          </div>
        </div>

        <!-- ФАЗА 4: ИТОГИ РАУНДА -->
        <div
          v-else-if="gameStore.gameStatus === EGameStatus.STARTED && gameStore.roundStatus === ERoundStatus.FINISHED"
          key="round-finished"
          class="neo-box p-8 bg-white w-full max-w-lg text-center my-auto shadow-neo-lg"
        >
          <div class="text-5xl mb-3">🏆</div>
          <h2 class="text-3xl font-black mb-3 text-neo-pink">РАУНД ЗАВЕРШЕН!</h2>
          <div class="text-xl font-bold mb-6">
            Победитель раунда:
            <div class="mt-2">
              <span class="bg-neo-yellow px-4 py-1.5 border-3 border-black rounded-xl font-black text-2xl inline-block shadow-neo-sm">
                {{ getWinnerNicknames() }}
              </span>
            </div>
          </div>
          <p class="font-black text-xs uppercase tracking-wider text-gray-500 animate-pulse">
            Готовься, следующий раунд начнется автоматически...
          </p>
        </div>

        <!-- ФАЗА 5: ФИНАЛ ВСЕЙ ИГРЫ -->
        <div
          v-else-if="gameStore.gameStatus === EGameStatus.FINISHED"
          key="game-finished"
          class="neo-box p-8 bg-neo-green w-full max-w-xl text-center my-auto shadow-neo-lg"
        >
          <h1 class="text-4xl font-black mb-2">🎉 ИГРА ОКОНЧЕНА!</h1>
          <p v-if="gameStore.finishReason" class="font-bold text-sm bg-white border-2 border-black p-2 rounded-lg mb-4">
            {{ gameStore.finishReason }}
          </p>

          <div v-if="gameStore.finalLeaderboard.length > 0" class="space-y-3 my-6">
            <div
              v-for="(scorer, idx) in gameStore.finalLeaderboard"
              :key="scorer.nickname"
              :class="idx === 0 ? 'bg-neo-yellow scale-105' : 'bg-white'"
              class="flex justify-between items-center p-3.5 border-3 border-black rounded-xl font-black text-lg shadow-neo-sm"
            >
              <span class="flex items-center gap-2">
                <span>{{ idx === 0 ? '👑' : `#${idx + 1}` }}</span>
                <span>{{ scorer.nickname }}</span>
              </span>
              <span class="bg-black text-white px-3 py-1 rounded-lg text-sm">
                {{ scorer.score }} очков
              </span>
            </div>
          </div>

          <button @click="onLeave" class="neo-btn bg-white w-full py-4 text-xl neo-box-hover">
            ВЕРНУТЬСЯ В ЛОББИ 🏠
          </button>
        </div>
      </Transition>

      <!-- 3. РУКА ИГРОКА (КАРТЫ ВНИЗУ) -->
      <footer
        v-if="
          gameStore.gameStatus === EGameStatus.STARTED &&
          gameStore.roundStatus === ERoundStatus.PICKING &&
          gameStore.hand.length > 0 &&
          !gameStore.hasPickedInRound
        "
        class="w-full mt-auto pt-4"
      >
        <div class="text-xs font-black uppercase tracking-wider mb-3 text-center bg-black text-white py-1.5 px-4 rounded-xl border-2 border-black max-w-md mx-auto">
          Твоя рука ({{ gameStore.hand.length }} карт) — выбери одну:
        </div>

        <TransitionGroup
          name="card-list"
          tag="div"
          class="flex items-center justify-start md:justify-center gap-4 overflow-x-auto pb-4 pt-3 px-2"
        >
          <div
            v-for="card in gameStore.hand"
            :key="card.id"
            class="neo-box p-2.5 bg-white flex-shrink-0 w-44 md:w-52 transform hover:-translate-y-4 hover:rotate-1 transition-all shadow-neo hover:shadow-neo-lg flex flex-col justify-between"
          >
            <div class="relative mb-2">
              <img
                :src="card.url"
                alt="Мем"
                @click="zoomedImage = card.url"
                class="w-full h-36 md:h-44 object-contain bg-neo-bg border-2 border-black rounded-lg cursor-zoom-in"
              />
              <button
                @click.stop="zoomedImage = card.url"
                class="absolute top-1.5 right-1.5 bg-white border-2 border-black px-1.5 py-0.5 rounded text-xs font-black"
                title="Рассмотреть поближе"
              >
                🔍
              </button>
            </div>
            <button
              @click="gameStore.pickCard(card.id)"
              class="neo-btn bg-neo-yellow hover:bg-neo-green text-xs py-2 w-full"
            >
              СКИНУТЬ НА СТОЛ 🔥
            </button>
          </div>
        </TransitionGroup>
      </footer>
    </main>

    <!-- МОДАЛКА ЗУМА КАРТИНКИ -->
    <Transition name="pop">
      <div
        v-if="zoomedImage"
        @click="zoomedImage = null"
        class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
      >
        <div class="neo-box p-3 bg-white max-w-2xl max-h-[90vh] flex flex-col items-center">
          <img :src="zoomedImage" class="max-h-[75vh] w-auto object-contain border-3 border-black rounded-lg" />
          <button @click="zoomedImage = null" class="neo-btn bg-neo-pink text-white text-xs mt-3 py-1.5">
            Закрыть превью
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { EGameStatus, ERoundStatus } from '@/types';
import { Clock, LogOut, UserCheck, Copy } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const authStore = useAuthStore();
const toast = useToastStore();

const timeLeft = ref<number | null>(null);
const zoomedImage = ref<string | null>(null);
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
  }, 300);
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const isPlayerReady = (userId: string) => {
  if (gameStore.roundStatus === ERoundStatus.PICKING) {
    return gameStore.pickedUsers.has(userId);
  }
  if (gameStore.roundStatus === ERoundStatus.VOTING) {
    return gameStore.votedUsers.has(userId);
  }
  return false;
};

const copyRoomCode = () => {
  if (!gameStore.game?.code) return;
  navigator.clipboard.writeText(gameStore.game.code);
  toast.info(`Код комнаты ${gameStore.game.code} скопирован!`);
};

const getWinnerNicknames = () => {
  const winners = gameStore.players
    .filter((p) => gameStore.currentWinnerIds.includes(p.id))
    .map((p) => p.nickname);
  return winners.length > 0 ? winners.join(', ') : 'Никто не голосовал (Ничья)';
};

const onLeave = () => {
  gameStore.leaveGame();
  router.push('/');
};
</script>