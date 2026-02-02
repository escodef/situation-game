CREATE TYPE "game_status" AS ENUM ('WAITING', 'STARTED', 'FINISHED');
CREATE TYPE "round_status" AS ENUM ('WAITING', 'STARTED', 'FINISHED');
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN', 'CREATOR');

CREATE TABLE "games" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(6) NOT NULL UNIQUE,
    "owner_id" UUID,
    "status" "game_status" DEFAULT 'WAITING',
    "rounds" INTEGER NOT NULL,
    "max_players" INTEGER NOT NULL,
    "date_created" TIMESTAMP DEFAULT NOW(),
    "is_open" BOOLEAN DEFAULT FALSE
);

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nickname" VARCHAR(255) NOT NULL,
    "roles" "user_role_enum"[] DEFAULT '{USER}',
    "score" INTEGER DEFAULT 0,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "game_id" UUID REFERENCES "games"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "email_idx" ON "users" ("email");

ALTER TABLE "games" ADD CONSTRAINT "games_owner_id_fkey";
FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE TABLE "sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "cards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "card_pack_id" UUID REFERENCES card_packs(id)
);

CREATE TABLE "card_packs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
);

CREATE TABLE "situations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "text" VARCHAR(500) NOT NULL,
    "is_adult" BOOLEAN DEFAULT FALSE,
    "category" VARCHAR(255) NOT NULL,
    "situation_pack_id" UUID REFERENCES situation_packs(id)
);

CREATE TABLE "situation_packs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(500) NOT NULL
);

CREATE TABLE "game_card_packs" (
    "game_id" UUID REFERENCES "games"("id") ON DELETE CASCADE,
    "card_pack_id" UUID REFERENCES "card_packs"("id") ON DELETE CASCADE,
    PRIMARY KEY ("game_id", "card_pack_id")
);

CREATE TABLE "game_situation_packs" (
    "game_id" UUID REFERENCES "games"("id") ON DELETE CASCADE,
    "situation_pack_id" UUID REFERENCES "situation_packs"("id") ON DELETE CASCADE,
    PRIMARY KEY ("game_id", "situation_pack_id")
);


CREATE TABLE "game_rounds" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "game_id" UUID REFERENCES games(id),
    "round_number" INTEGER,
    "situation_id" UUID REFERENCES situations(id),
    "status" "round_status" DEFAULT 'WAITING',
);

CREATE TABLE "player_moves" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "round_id" UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
    "player_id" UUID REFERENCES users(id) ON DELETE CASCADE,
    "card_id" UUID REFERENCES cards(id),
);

CREATE TABLE "player_hands" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "game_id" UUID REFERENCES "games"("id") ON DELETE CASCADE,
    "player_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "card_id" UUID REFERENCES "cards"("id"),
    UNIQUE("player_id", "card_id")
);

CREATE TABLE "votes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "round_id" UUID REFERENCES "game_rounds"("id"),
    "voter_id" UUID REFERENCES "users"("id"),
    "target_player_id" UUID REFERENCES "users"("id"),
    UNIQUE("round_id", "voter_id")
);