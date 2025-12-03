import { integer, pgEnum, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['user', 'admin']);

export const usersTable = pgTable(
    'users',
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        nickname: varchar().notNull(),
        age: integer(),
        email: varchar().notNull(),
        password: varchar(),
        role: rolesEnum().default('user'),
    },
    (table) => [uniqueIndex('email_idx').on(table.email)],
);
