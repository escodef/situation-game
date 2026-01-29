import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 20 }).notNull().unique(),
});
