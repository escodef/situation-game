import { relations } from 'drizzle-orm';
import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { EGameStatus } from 'src/shared/enums';
import { userTable } from './user.schema';

export const statusEnum = pgEnum('status', EGameStatus);

export const gamesTable = pgTable('games', {
    id: uuid().defaultRandom(),
    code: varchar('code', { length: 6 }).unique().notNull(),
    ownerId: uuid('owner_id').references(() => userTable.id),
    status: statusEnum().default(EGameStatus.WAITING),
    maxPlayers: integer('max_players'),
    dateCreated: timestamp('date_created').defaultNow(),
    isOpen: boolean('is_open').default(false),
});

export const gamesRelations = relations(gamesTable, ({ many }) => ({
    players: many(userTable),
}));
