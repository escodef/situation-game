# WebSocket API Documentation — Situation Game

Данный документ описывает протокол взаимодействия по WebSocket между клиентом и сервером.

---

## 1. Подключение и Авторизация

* **Эндпоинт:** `ws://<host>:<port>/ws` (или `wss://` для HTTPS/WSS)
* **Протокол:** JSON поверх стандартного WebSocket.
* **Авторизация:** Передаётся через query-параметр `token` (Access Token, полученный при логине/рефреше).

### Пример подключения:
```
ws://localhost:3000/ws?token=eyJ...
```

### Поведение при подключении:
1. **Валидация токена:** Сервер проверяет подлинность JWT и наличие активной сессии в БД (`sessions`). Если токен невалиден или истёк — соединение отклоняется (`UnauthorizedError`).
2. **Одиночная сессия:** Если пользователь уже был подключён с другого устройства/вкладки, предыдущее соединение закрывается со статусом `4000` и текстом `'Обнаружен логин с другого устройства'`.
3. **Статус Presence:** В Valkey (Redis) выставляется ключ `presence:<userId> = 'online'`.
4. **Автоматический вход в комнату:** Если у пользователя в базе уже есть привязка к активной игре (`game_id`), сокет автоматически подписывается на события комнаты игры и сразу отправляет клиенту событие `GAME_STATE`.

---

## 2. Формат сообщений

### 2.1. Исходящие от клиента (Client -> Server)
Все сообщения от клиента строго валидируются схемой `SocketBodySchema`.

```json
{
  "event": "EVENT_NAME",
  "data": { ... } // или отсутствует/undefined для событий без параметров
}
```

### 2.2. Входящие от сервера (Server -> Client)
```json
{
  "event": "EVENT_NAME",
  "data": { ... }
}
```
*Либо в случае ошибок:*
```json
{
  "event": "ERROR",
  "data": "Текст ошибки"
}
```

---

## 3. Клиентские события (Incoming / Client -> Server)

### 3.1. `JOIN_GAME`
Подключение к комнате игры в WebSocket. 
> **Важно:** Перед отправкой этого сокет-события игрок уже должен предварительно вступить в игру через HTTP-эндпоинт `POST /api/game/join`.

* **Payload:**
```json
{
  "event": "JOIN_GAME",
  "data": {
    "gameId": "8553ec4b-1473-4554-b5b4-d5fdcaab0a0b"
  }
}
```

### 3.2. `START_GAME`
Старт игры. Может вызывать только создатель комнаты (`ownerId`). В комнате должно быть минимум 2 игрока.

* **Payload:**
```json
{
  "event": "START_GAME"
}
```

### 3.3. `PICK_CARD`
Выбор карты из своей руки для текущей ситуации в раунде. Разрешён только на этапе раунда `PICKING`.

* **Payload:**
```json
{
  "event": "PICK_CARD",
  "data": {
    "roundId": "b1821cf3-0cf4-4903-8d62-a27906d5cb30",
    "cardId": "34c382ce-9e05-4f46-a4c3-b097b6920f77"
  }
}
```

### 3.4. `VOTE`
Голосование за понравившийся ответ другого игрока. Разрешён только на этапе раунда `VOTING`. Нельзя голосовать за самого себя.

* **Payload:**
```json
{
  "event": "VOTE",
  "data": {
    "targetUserId": "713ddbc2-4e4b-4c5c-9c71-2bfafeac5f0c"
  }
}
```

### 3.5. `LEAVE_GAME`
Добровольный выход из игры во время матча.

* **Payload:**
```json
{
  "event": "LEAVE_GAME"
}
```

---

## 4. Серверные события (Outcome / Server -> Client)

### 4.1. `GAME_STATE`
Отправляется **персонально игроку** сразу после подключения к сокету, если он уже состоит в игре. Используется для восстановления интерфейса при перезагрузке страницы / переподключении.

```json
{
  "event": "GAME_STATE",
  "data": {
    "game": {
      "id": "uuid",
      "code": "AB12CD",
      "status": "STARTED", // "WAITING" | "STARTED" | "FINISHED"
      "maxPlayers": 6,
      "maxRounds": 5,
      "isOpen": false,
      "players": [
        { "id": "uuid", "nickname": "kostya", "score": 2 }
      ]
    },
    "currentRound": {
      "id": "uuid",
      "gameId": "uuid",
      "roundNumber": 2,
      "situationId": "uuid",
      "status": "VOTING", // "PICKING" | "VOTING" | "SHOWING" | "FINISHED"
      "endsAt": "2026-03-30T12:00:30.000Z"
    },
    "hand": [
      {
        "id": "uuid-card-1",
        "url": "https://s3.../cards/image1.png"
      }
    ],
    "moves": [
      // Доступно только если раунд в статусе SHOWING или VOTING
      {
        "roundId": "uuid",
        "userId": "uuid",
        "cardId": "uuid",
        "card": {
          "url": "https://s3.../cards/image2.png"
        }
      }
    ]
  }
}
```

---

### 4.2. `PLAYER_JOINED`
Рассылается всей комнате, когда игрок подключился по WS.

```json
{
  "event": "PLAYER_JOINED",
  "data": {
    "userId": "uuid",
    "nickname": "Alex",
    "score": 0
  }
}
```

---

### 4.3. `PLAYER_LEFT`
Рассылается комнате, когда игрок покинул игру (через `LEAVE_GAME` или по таймауту дисконнекта 30 сек).

```json
{
  "event": "PLAYER_LEFT",
  "data": {
    "userId": "uuid"
  }
}
```

---

### 4.4. `GAME_STARTED`
Рассылается всем участникам при старте первого или каждого следующего раунда. Означает переход в фазу выбора карт (`PICKING`).
* **Таймаут фазы:** 60 секунд.

```json
{
  "event": "GAME_STARTED",
  "data": {
    "roundId": "uuid",
    "situationText": "Когда по пьяни сказал пароль от своего телефона.",
    "endsAt": "2026-03-30T12:01:00.000Z"
  }
}
```

> **Одновременно с этим событием каждому игроку индивидуально** отправляется обновление его руки:
```json
{
  "event": "ROUND_STAGE_CHANGED",
  "data": {
    "status": "PICKING",
    "hand": [
      { "id": "uuid-1", "url": "https://s3.../1.jpg" },
      { "id": "uuid-2", "url": "https://s3.../2.jpg" }
    ]
  }
}
```

---

### 4.5. `CARD_PICKED`
Уведомление комнате, что один из игроков сделал свой ход (выбрал карту). Сама карта **не раскрывается** до окончания фазы выбора.

```json
{
  "event": "CARD_PICKED",
  "data": {
    "userId": "uuid"
  }
}
```

---

### 4.6. `ROUND_STAGE_CHANGED`
Ключевое событие смены фаз раунда и окончания игры.

#### Вариант А: Переход к голосованию (`VOTING`)
Срабатывает, когда все игроки сделали ход или истёк 60-секундный таймер (не сделавшим ход карты подбираются случайно).
* **Длительность голосования:** 30 секунд.

```json
{
  "event": "ROUND_STAGE_CHANGED",
  "data": {
    "status": "VOTING",
    "moves": [
      {
        "roundId": "uuid",
        "userId": "uuid-player-1",
        "cardId": "uuid-card-1",
        "card": {
          "url": "https://s3.../meme1.jpg"
        }
      },
      {
        "roundId": "uuid",
        "userId": "uuid-player-2",
        "cardId": "uuid-card-2",
        "card": {
          "url": "https://s3.../meme2.jpg"
        }
      }
    ]
  }
}
```

#### Вариант Б: Игрок проголосовал (`PLAYER_VOTED`)
```json
{
  "event": "PLAYER_VOTED",
  "data": {
    "voterId": "uuid"
  }
}
```

#### Вариант В: Подведение итогов раунда (`FINISHED`)
Срабатывает, когда все проголосовали или истёк 30-секундный таймер. Победителям начисляется по +1 баллу. Через 5 секунд автоматически начнётся следующий раунд (придёт `GAME_STARTED`).

```json
{
  "event": "ROUND_STAGE_CHANGED",
  "data": {
    "status": "FINISHED",
    "winnerIds": ["uuid-winner-1"],
    "winnerId": "uuid-winner-1",
    "players": [
      { "id": "uuid-winner-1", "nickname": "kostya", "score": 3 },
      { "id": "uuid-player-2", "nickname": "alex", "score": 1 }
    ]
  }
}
```

#### Вариант Г: Завершение игры (Все раунды сыграны)
Отправляется сразу после итогов последнего раунда (`roundNumber >= maxRounds`).

```json
{
  "event": "ROUND_STAGE_CHANGED",
  "data": {
    "status": "FINISHED",
    "finalScores": [
      { "id": "uuid-1", "nickname": "kostya", "score": 3 },
      { "id": "uuid-2", "nickname": "alex", "score": 1 }
    ]
  }
}
```

---

### 4.7. `ERROR`
Отправляется в случае ошибки действия или досрочного развала игры (например, осталось меньше 2 игроков).

```json
{
  "event": "ERROR",
  "data": "Сейчас нельзя выбирать карты"
}
```

---

## 5. Полная схема жизненного цикла раунда (State Machine)

```text
[ ЛОББИ: WAITING ]
       │
       ▼ (START_GAME от хоста)
[ РАУНД: PICKING ] (60 сек)
       │  ├─ Игроки получают событие GAME_STARTED и обновлённый hand
       │  ├─ Игроки шлют PICK_CARD -> комната видит CARD_PICKED
       │
       ▼ (Все походили ИЛИ таймер 60с)
[ РАУНД: VOTING ] (30 сек)
       │  ├─ Комната получает ROUND_STAGE_CHANGED со списком вскрытых карт (moves)
       │  ├─ Игроки шлют VOTE -> комната видит PLAYER_VOTED
       │
       ▼ (Все проголосовали ИЛИ таймер 30с)
[ ИТОГИ РАУНДА: FINISHED ]
       │  ├─ Комната видит победителей и очки (ROUND_STAGE_CHANGED)
       │  ├─ Пауза 5 секунд
       │
       ├───> Если roundNumber < maxRounds  ──> [ Новый РАУНД: PICKING ]
       │
       └───> Если roundNumber >= maxRounds ──> [ ИГРА ОКОНЧЕНА: finalScores ]
```