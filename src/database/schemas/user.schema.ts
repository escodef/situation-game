import { relations } from 'drizzle-orm';
import {
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { EUserRole } from 'src/shared/enums/role.enum';
import { gamesTable } from './game.schema';
import { rolesTable } from './role.schema';

export const roleEnum = pgEnum('status', EUserRole);

export const userTable = pgTable(
    'user',
    {
        id: uuid().defaultRandom(),
        nickname: varchar().notNull(),
        role: roleEnum().default(EUserRole.USER),
        age: integer(),
        email: varchar().notNull(),
        password: varchar(),
        gameId: integer('game_id').references(() => gamesTable.id),
    },
    (table) => [uniqueIndex('email_idx').on(table.email)],
);

export const usersToRolesTable = pgTable(
    'users_to_roles',
    {
        userId: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }),
        roleId: integer('role_id').references(() => rolesTable.id, { onDelete: 'cascade' }),
    },
    (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const userRelations = relations(userTable, ({ many, one }) => ({
    roles: many(usersToRolesTable),
    game: one(gamesTable, {
        fields: [userTable.gameId],
        references: [gamesTable.id],
    }),
}));

export const usersToRolesRelations = relations(usersToRolesTable, ({ one }) => ({
    user: one(userTable, { fields: [usersToRolesTable.userId], references: [userTable.id] }),
    role: one(rolesTable, { fields: [usersToRolesTable.roleId], references: [rolesTable.id] }),
}));
