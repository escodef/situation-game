import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const situationTable = pgTable('situations', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    text: varchar({ length: 500 }).notNull(),
    isAdult: boolean().default(false),
    category: varchar({ length: 255 }).notNull(),
});
