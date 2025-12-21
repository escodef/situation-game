import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';

export const statusEnum = pgEnum('status', ['waiting', 'in_progress', 'finished']);

export const gamesTable = pgTable('games', {
    id: uuid().defaultRandom(),
    ownerId: uuid('owner_id').references(() => userTable.id),
    status: statusEnum().default('waiting'),
    maxPlayers: integer('max_players'),
    dateCreated: timestamp('date_created').defaultNow(),
    isOpen: boolean('is_open').default(false),
});

export const gamesRelations = relations(gamesTable, ({ many }) => ({
    players: many(userTable),
}));
