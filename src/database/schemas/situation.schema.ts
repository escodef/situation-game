import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const situationsTable = pgTable('situations', {
    id: uuid().defaultRandom(),
    text: varchar({ length: 500 }).notNull(),
    isAdult: boolean('is_adult').default(false),
    category: varchar().notNull(),
});
