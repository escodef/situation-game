import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const memesTable = pgTable('memes', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: varchar({ length: 255 }).notNull(),
});
