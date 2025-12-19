import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const memesTable = pgTable('memes', {
    id: uuid().defaultRandom(),
    url: varchar().notNull(),
});
