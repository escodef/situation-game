import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable } from 'drizzle-orm/pg-core';
import { playersTable } from './player.schema';

export const statusEnum = pgEnum('roles', ['waiting', 'in_progress', 'finished']);

export const gamesTable = pgTable('games', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    status: statusEnum().default('waiting'),
    maxPlayers: integer('max_players'),
});

export const gamesRelations = relations(gamesTable, ({ many }) => ({
	players: many(playersTable),
}));