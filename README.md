<div align="center">

# 🃏 SITUATION GAME

**Многопользовательская браузерная мем-игра**

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![ElysiaJS](https://img.shields.io/badge/ElysiaJS-212121?style=for-the-badge&logo=elysia&logoColor=79A8FF)](https://elysiajs.com)
[![Vue.js](https://img.shields.io/badge/Vue.js%203-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis/Valkey](https://img.shields.io/badge/Valkey%20%2F%20Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://valkey.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🔥 О проекте

**Situation Game (Meme Wars)** — это веб-воплощение легендарной настольной игры для компаний («Какой ты мем?» / *What Do You Meme?*). Игроки собираются в комнате, на стол выкладывается жизненная, кринжовая или абсурдная текстовая ситуация, и каждый участник анонимно выбирает из своей руки самую угарную картинку-мем, которая идеально описывает этот момент. После этого начинается всеобщее голосование за лучший панчлайн!

Проект спроектирован с упором на **максимальную отзывчивость в реальном времени**, **горизонтальную масштабируемость** через Pub/Sub шину и **сочный визуал в стиле Neobrutalism**.

---

## 🎮 Игровой процесс (Game Loop)

Жизненный цикл каждой партии управляется распределённым конечным автоматом (State Machine) на базе WebSocket и фоновых очередей `BullMQ`:

```text
[ ЛОББИ: WAITING ] ──(Игроки заходят по 6-значному коду или из списка)
       │
       ▼ (Хост жмёт «СТАРТ» -> раздача по 5 карт каждому)
[ РАУНД: PICKING (60 сек) ]
       │  ├─ На столе появляется случайная ситуация из выбранных паков
       │  ├─ Игроки выбирают мем из руки (событие PICK_CARD)
       │  ├─ Если таймер истёк — AFK-игрокам карта выбирается рандомно
       │
       ▼ (Все сделали ход ИЛИ истёк таймер 60с)
[ РАУНД: VOTING (30 сек) ]
       │  ├─ Карты вскрываются на столе в случайном порядке
       │  ├─ Игроки голосуют за самый смешной мем (голосовать за себя нельзя!)
       │
       ▼ (Все проголосовали ИЛИ истёк таймер 30с)
[ ИТОГИ РАУНДА: FINISHED (5 сек) ]
       │  ├─ Подсчёт голосов, начисление +1 очка лидерам раунда, залп конфетти 🎉
       │  ├─ Автоматический добор карт в руку до 5 штук
       │
       ├───> Раунд < maxRounds ──> Переход к следующему раунду [ PICKING ]
       │
       └───> Раунд == maxRounds ─> [ ФИНАЛ ИГРЫ: Пьедестал победителей 🏆 ]
```

### Ключевые фичи:
* **🔓 Открытые и закрытые комнаты:** Создавай публичные лобби или закрытые тусовки для друзей с входом по 6-значному коду (`AB12CD`).
* **📦 Кастомный контент (UGC):** Загружай собственные наборы картинок-мемов напрямую в S3-хранилище и создавай свои авторские паки текстовых ситуаций.
* **🔄 Умный реконнект и анти-афк:** Если у игрока моргнул интернет или он обновил страницу (`F5`), система удерживает его слот в течение 30 секунд (`presence` в Valkey) и мгновенно восстанавливает весь стол, таймер и карты на руках через событие `GAME_STATE`.

---

## 🛠 Технологический стек

### Backend (`/backend`)
* **Рантайм:** [Bun](https://bun.sh/) — сверхбыстрый JavaScript/TypeScript рантайм (нативное хеширование паролей `Bun.password`, мгновенный старт).
* **Фреймворк:** [ElysiaJS](https://elysiajs.com/) — строгая типизация, встроенная валидация через `TypeBox` и нативные WebSockets (`uWebSockets`).
* **База данных:** **PostgreSQL** + драйвер `pg` (Connection Pool). Чистый, оптимизированный SQL с использованием `CTE (WITH)`, оконных функций (`ROW_NUMBER() OVER (ORDER BY RANDOM())`), транзакций и блокировок строк `FOR UPDATE`.
* **In-Memory & Очереди:** **Valkey / Redis** (`ioredis`) + **BullMQ**:
  * Точные отложенные джобы таймеров раундов (`picking`, `voting`, `next_round`);
  * Межинстансовая шина событий (`Pub/Sub` канал `game-ws-events`) для синхронизации WebSocket-комнат;
  * Контроль онлайн-присутствия (`presence:<userId>`).
* **Хранилище медиа:** **S3 / MinIO** (`@aws-sdk/client-s3`) — хранение загруженных карточек-мемов.
* **Авторизация:** Двухтокенная схема **JWT** (`Access Token` в заголовке + ротируемый `HttpOnly` `Refresh Token` в куках с хранением сессий в БД и фоновым крон-очистителем `@elysiajs/cron`).
* **Документация и Мониторинг:** Автогенерация **Swagger / OpenAPI** (`@elysiajs/openapi`) + трекинг ошибок **Sentry** (`@sentry/bun`).

### Frontend (`/frontend`)
* **Фреймворк:** **Vue 3** (Composition API, `<script setup>`) + **TypeScript**.
* **Сборщик:** **Vite** — мгновенный HMR и проксирование API/WS.
* **Стейт-менеджмент:** **Pinia** — реактивные сторы для авторизации, игрового цикла и системы уведомлений.
* **Роутинг и Сеть:** **Vue Router 4** (Navigation Guards) + **Axios** (перехватчики для автоматического бесшовного обновления `accessToken` при `401`).
* **Стилизация и UI:** **Tailwind CSS**, иконки `lucide-vue-next` и салюты `canvas-confetti`.

---

## 📂 Архитектура и структура репозитория

```text
situation-game/
├── .github/workflows/           # CI/CD пайплайны автосборки и деплоя (Backend & Frontend)
├── docker-compose.yml           # Инфраструктура: PostgreSQL, Valkey/Redis, контейнеры приложения
│
├── backend/                     # Серверная часть (Bun + Elysia)
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/     # Обработчики REST-запросов (auth, game, card-pack, situation-pack, user)
│   │   │   ├── plugins/         # Плагины Elysia (CORS, OpenAPI/Swagger, Cron очистки сессий)
│   │   │   ├── routers/         # Декларация маршрутов и схем валидации
│   │   │   ├── socket/          # WebSocket-менеджер (Valkey Pub/Sub) и процессоры игровых событий
│   │   │   └── server.ts        # Точка сборки HTTP + WS сервера и глобальный обработчик ошибок
│   │   ├── database/
│   │   │   ├── migrations/      # SQL-миграции (001_init.sql с advisory lock)
│   │   │   ├── repositories/    # Слой работы с БД (GameRepo, PlayerHandRepo, PlayerMoveRepo и др.)
│   │   │   ├── seeders/         # Автоматическое наполнение БД (Аккаунт админа + 8 категорий ситуаций)
│   │   │   ├── data-source.ts   # Настройка пула соединений PostgreSQL
│   │   │   └── valkey.ts        # Подключения ioredis (основное + подписчик)
│   │   ├── queue/               # Очереди и воркеры BullMQ (таймеры фаз раунда)
│   │   ├── s3/                  # Клиент и утилиты загрузки/удаления файлов в S3
│   │   ├── services/            # Бизнес-логика (GameLoopService — оркестратор раундов)
│   │   ├── shared/              # Общие типы, интерфейсы, DTO-схемы TypeBox, JWT-утилиты и константы
│   │   └── index.ts             # Точка входа (Bootstrap: миграции -> сиды -> старт сервера)
│   └── WEBSOCKET.md             # Полная спецификация WebSocket-протокола
│
└── frontend/                    # Клиентская часть (Vue 3 + TypeScript + Vite)
    ├── src/
    │   ├── api/                 # Axios-инстанс с auto-refresh и WebSocket-клиент с очередью сообщений
    │   ├── components/          # Переиспользуемые UI-компоненты (NeoToast и др.)
    │   ├── router/              # Маршрутизация и защита приватных роутов
    │   ├── stores/              # Pinia-сторы (auth, game, toast)
    │   ├── types/               # TypeScript-контракты и Enum'ы, синхронизированные с бэкендом
    │   ├── views/               # Экраны: AuthView, LobbyView, GameBoardView, PackManagerView
    │   ├── App.vue              # Корневой компонент с переходами
    │   └── style.css            # Дизайн-система Neobrutalism и кастомные анимации
    └── vite.config.ts           # Конфигурация сборщика и dev-прокси
```

---

## 🗄 Схема базы данных

База данных спроектирована в 3-й нормальной форме с жёсткими ограничениями целостности (`CHECK`, `UNIQUE`, каскадные внешние ключи):

* `users` — профили игроков, роли (`USER`, `ADMIN`, `CREATOR`), текущая привязка к комнате и счёт в матче.
* `sessions` — активные JWT-сессии с поддержкой ротации токенов.
* `games` — комнаты (`code` из 6 символов, статус `WAITING | STARTED | FINISHED`, лимиты игроков и раундов).
* `card_packs` & `cards` — наборы карточек и ссылки на изображения в S3.
* `situation_packs` & `situations` — наборы ситуаций (на старте автоматически сидируется **«Стандартный» пак из 8 категорий** и сотен ситуаций).
* `game_rounds` — раунды конкретной игры, привязанная ситуация, статус фазы и дедлайн `ends_at`.
* `player_hands` — текущие карты на руках у каждого игрока в рамках партии.
* `player_moves` — сброшенные на стол карты в текущем раунде (уникальный индекс не даёт сходить дважды).
* `votes` — голоса игроков в раунде (ограничение `CHECK ("voter_id" <> "target_user_id")` на уровне СУБД запрещает голосовать за самого себя).

---

## 🚀 Быстрый старт (Локальная разработка)

### 1. Предварительные требования
* **Docker & Docker Compose** (для PostgreSQL и Redis/Valkey)
* **Bun** (`v1.1+`) — для запуска бэкенда
* **Node.js** (`v20+`) или **Bun** — для запуска фронтенда

### 2. Запуск инфраструктуры (БД и Redis)
В корне проекта поднимите контейнеры базы данных и Redis:

```bash
docker compose up -d db redis
```

### 3. Настройка и запуск Бэкенда
Перейдите в папку `backend`, создайте файл `.env`:

```bash
cd backend
```

Пример `backend/.env`:
```env
NODE_ENV=development
PORT=3000
OPENAPI_PATH=/openapi

# Подключение к контейнерам Docker
DATABASE_URL=postgres://user:password@localhost:5433/game_logic
VALKEY_URL=redis://localhost:6379

# Конфигурация JWT
JWT_ACCESS_SECRET=super_secret_access_key_change_me_123456
JWT_REFRESH_SECRET=super_secret_refresh_key_change_me_654321
JWT_ACCESS_EXPIRES_IN=1800
JWT_REFRESH_EXPIRES_IN=604800

# Настройки S3 (MinIO / AWS / Selectel)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=key
S3_SECRET_ACCESS_KEY=key
S3_BUCKET_NAME=my-bucket
S3_REGION=ru-msk

# Дефолтный администратор (создаётся при старте)
ADMIN_EMAIL=admin@example.com
ADMIN_NICKNAME=admin
ADMIN_PASSWORD=password123
```

Установите зависимости и запустите сервер в режиме разработки:
```bash
bun install
bun run start:dev
```
> При первом старте сервер **автоматически** выполнит SQL-миграции, создаст аккаунт администратора и заполнит базу сотнями ситуаций в 8 категориях («Знакомства и свидания», «Работа и карьера», «Учёба и экзамены», «Друзья и тусовки», «Семейные приколы», «Игры и геймеры», «Классические», «Абсурд»).

* **Swagger UI (OpenAPI):** доступен по адресу `http://localhost:3000/openapi`

### 4. Настройка и запуск Фронтенда
Откройте второй терминал и перейдите в папку `frontend`:

```bash
cd frontend
```

Создайте файл `frontend/.env`:
```env
VITE_API_URL=/api
VITE_WS_URL=ws://localhost:5173/ws
```

Установите зависимости и запустите dev-сервер Vite:
```bash
npm install
npm run dev
```

Откройте браузер по адресу **`http://localhost:5173`**!

---

## 🧪 Быстрый посев тестовых мемов (без настройки S3)

Если вы тестируете проект локально без поднятого S3-хранилища, вы можете одной командой добавить стартовый набор из 10 популярных мемов напрямую в PostgreSQL:

```bash
docker exec -it game_db psql -U user -d game_logic -c "WITH p AS (INSERT INTO card_packs (name) VALUES ('Базовые мемы') RETURNING id) INSERT INTO cards (card_pack_id, url) SELECT id, unnest(ARRAY['https://i.imgflip.com/30b1gx.jpg', 'https://i.imgflip.com/1g8my4.jpg', 'https://i.imgflip.com/261o3j.jpg', 'https://i.imgflip.com/1ur9b0.jpg', 'https://i.imgflip.com/2fm6x.jpg', 'https://i.imgflip.com/4t0m5.jpg', 'https://i.imgflip.com/1otk96.jpg', 'https://i.imgflip.com/3lmzyx.jpg', 'https://i.imgflip.com/2gnnjh.jpg', 'https://i.imgflip.com/1bij.jpg']) FROM p;"
```

---

## 🔌 Краткий справочник API и WebSocket

### Основные HTTP эндпоинты (`/api`)
| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Регистрация нового игрока |
| `POST` | `/api/auth/login` | Вход (возвращает `accessToken` и ставит `HttpOnly` куку `refreshToken`) |
| `POST` | `/api/auth/refresh` | Ротация сессии и обновление токенов |
| `GET` | `/api/user/me` | Получение профиля текущего пользователя |
| `GET` | `/api/game` | Список открытых комнат с пагинацией |
| `POST` | `/api/game` | Создание новой игровой комнаты с выбранными паками |
| `POST` | `/api/game/join` | Вступление в комнату по `gameId` или 6-значному `code` |
| `GET / POST` | `/api/card-pack` | Получение списка и загрузка новых наборов карточек (`multipart/form-data`) |
| `GET / POST` | `/api/situation-pack` | Получение списка и создание пользовательских наборов ситуаций |

### События WebSocket (`/ws?token=<JWT>`)
* **От клиента (Client -> Server):**
  * `JOIN_GAME` — подписка сокета на комнату игры
  * `START_GAME` — запуск партии создателем лобби
  * `PICK_CARD` — сброс выбранной карты на стол в текущем раунде
  * `VOTE` — голосование за карту соперника
  * `LEAVE_GAME` — выход из комнаты
* **От сервера (Server -> Client):**
  * `GAME_STATE` — полный слепок состояния игры при подключении / реконнекте
  * `PLAYER_JOINED` / `PLAYER_LEFT` — вход и выход участников
  * `GAME_STARTED` — старт нового раунда, текст ситуации и таймер `endsAt`
  * `CARD_PICKED` / `PLAYER_VOTED` — индикация готовности игроков в реальном времени
  * `ROUND_STAGE_CHANGED` — смена фаз (`PICKING` -> `VOTING` -> `FINISHED`), раздача руки и финальный лидерборд
  * `ERROR` — уведомление о некорректном действии или досрочном завершении матча

*(Подробная документация со всеми JSON-пейлоадами находится в файле [`backend/WEBSOCKET.md`](./backend/WEBSOCKET.md)).*

---

## 🚢 CI/CD и Production Деплой

В репозитории настроены GitHub Actions воркфлоу (`.github/workflows/backend.yml` и `.github/workflows/frontend.yml`) для автоматической сборки Docker-образов `game-backend:latest` и `game-frontend:latest` при пуше в ветку `main` на self-hosted раннере с бесшовным перезапуском через `docker compose up -d --no-deps`.

---