CREATE TYPE "public"."status" AS ENUM('waiting', 'in_progress', 'finished');--> statement-breakpoint
CREATE TABLE "games" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "games_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "status" DEFAULT 'waiting',
	"max_players" integer
);
--> statement-breakpoint
CREATE TABLE "memes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "players_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nickname" varchar NOT NULL,
	"age" integer,
	"email" varchar NOT NULL,
	"password" varchar,
	"game_id" integer
);
--> statement-breakpoint
CREATE TABLE "situations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "situations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" varchar(500) NOT NULL,
	"is_adult" boolean DEFAULT false,
	"category" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "players" USING btree ("email");