import { relations } from 'drizzle-orm';
import { integer, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { gamesTable } from './game.schema';

export const playersTable = pgTable(
    'players',
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        nickname: varchar().notNull(),
        age: integer(),
        email: varchar().notNull(),
        password: varchar(),
        gameId: integer('game_id').references(() => gamesTable.id),
    },
    (table) => [uniqueIndex('email_idx').on(table.email)],
);


export const playersRelations = relations(playersTable, ({ one }) => ({
	game: one(gamesTable, {
		fields: [playersTable.gameId],
		references: [gamesTable.id],
	}),
}));