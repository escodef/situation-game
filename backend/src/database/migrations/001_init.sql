BEGIN;

CREATE TABLE "games" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "owner_id" UUID,
    "status" TEXT DEFAULT 'WAITING',
    "max_rounds" INTEGER NOT NULL,
    "max_players" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "is_open" BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_code_len CHECK(length(code) = 6),
    CONSTRAINT chk_game_status CHECK (status IN ('WAITING', 'STARTED', 'FINISHED'))
);

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nickname" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT '{USER}',
    "score" INTEGER DEFAULT 0,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "game_id" UUID REFERENCES "games"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_nickname_len CHECK(length(nickname) <= 25),
    CONSTRAINT chk_email_len CHECK(length(email) <= 255),
    CONSTRAINT chk_password_min_len CHECK(length(password) >= 8),
    CONSTRAINT chk_password_max_len CHECK(length(password) <= 128),
    CONSTRAINT chk_user_roles CHECK (roles <@ ARRAY['USER', 'ADMIN', 'CREATOR']::TEXT[])
);

CREATE UNIQUE INDEX "email_idx" ON "users" ("email");

ALTER TABLE "games" ADD CONSTRAINT "games_owner_id_fkey"
FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE TABLE "sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "card_packs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_name_len CHECK(length(name) <= 255)
);

CREATE TABLE "cards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "card_pack_id" UUID REFERENCES card_packs(id)
);

CREATE TABLE "situation_packs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_name_len CHECK(length(name) <= 255)
);

CREATE TABLE "situations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "text" TEXT NOT NULL,
    "is_adult" BOOLEAN DEFAULT FALSE,
    "category" TEXT,
    "situation_pack_id" UUID REFERENCES situation_packs(id),
    CONSTRAINT chk_text_len CHECK(length(text) <= 500),
    CONSTRAINT chk_category_len CHECK(length(category) <= 40)

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
    "round_number" INTEGER NOT NULL,
    "situation_id" UUID REFERENCES situations(id),
    "status" TEXT DEFAULT 'PICKING',
    "ends_at" TIMESTAMPTZ NOT NULL,
    "remaining_ms" INTEGER DEFAULT 0,
    UNIQUE("game_id", "round_number"),
    CONSTRAINT chk_round_status CHECK (status IN ('PICKING', 'PAUSED', 'VOTING', 'SHOWING'))
);

CREATE TABLE "player_moves" (
    "round_id" UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
    "user_id" UUID REFERENCES users(id) ON DELETE CASCADE,
    "card_id" UUID REFERENCES cards(id) NOT NULL,
    PRIMARY KEY ("round_id", "user_id"), 
    CONSTRAINT "unique_card_per_round" UNIQUE ("round_id", "card_id")
);

CREATE TABLE "player_hands" (
    "game_id" UUID REFERENCES "games"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "card_id" UUID REFERENCES "cards"("id") ON DELETE CASCADE,
    PRIMARY KEY ("game_id", "user_id", "card_id")
);

CREATE TABLE "votes" (
    "round_id" UUID REFERENCES "game_rounds"("id"),
    "voter_id" UUID REFERENCES "users"("id"),
    "target_user_id" UUID REFERENCES "users"("id"),
    PRIMARY KEY ("round_id", "voter_id"),
    CONSTRAINT "no_self_voting" CHECK ("voter_id" <> "target_user_id")
);

CREATE INDEX "idx_users_game_id" ON "users" ("game_id");
CREATE INDEX "idx_sessions_user_id" ON "sessions" ("user_id");

COMMIT;