CREATE TYPE "game_status" AS ENUM ('WAITING', 'STARTED', 'FINISHED');
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN', 'CREATOR');

CREATE TABLE "games" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(6) NOT NULL UNIQUE,
    "owner_id" UUID,
    "status" "game_status" DEFAULT 'WAITING',
    "max_players" INTEGER,
    "date_created" TIMESTAMP DEFAULT NOW(),
    "is_open" BOOLEAN DEFAULT FALSE
);

CREATE TABLE "user" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nickname" VARCHAR(255) NOT NULL,
    "roles" "user_role_enum"[] DEFAULT '{USER}',
    "age" INTEGER,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "game_id" UUID REFERENCES "games"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "email_idx" ON "user" ("email");

ALTER TABLE "games" ADD CONSTRAINT "games_owner_id_fkey" 
FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL;

CREATE TABLE "refresh_tokens" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "user"("id") ON DELETE CASCADE,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "memes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL
);

CREATE TABLE "situations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "text" VARCHAR(500) NOT NULL,
    "is_adult" BOOLEAN DEFAULT FALSE,
    "category" VARCHAR(255) NOT NULL
);