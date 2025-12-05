import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const situationsTable = pgTable('situations', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    text: varchar({ length: 500 }).notNull(),
    isAdult: boolean('is_adult').default(false),
    category: varchar().notNull(),
});
