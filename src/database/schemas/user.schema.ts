import { relations } from 'drizzle-orm';
import { integer, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { gamesTable } from './game.schema';

export const userTable = pgTable(
    'user',
    {
        id: uuid().defaultRandom(),
        nickname: varchar().notNull(),
        age: integer(),
        email: varchar().notNull(),
        password: varchar(),
        gameId: integer('game_id').references(() => gamesTable.id),
    },
    (table) => [uniqueIndex('email_idx').on(table.email)],
);


export const userRelations = relations(userTable, ({ one }) => ({
	game: one(gamesTable, {
		fields: [userTable.gameId],
		references: [gamesTable.id],
	}),
}));