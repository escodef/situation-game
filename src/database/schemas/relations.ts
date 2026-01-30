import { relations } from 'drizzle-orm';
import { gamesTable } from './game.schema';
import { refreshTokensTable } from './refresh-token.schema';
import { rolesTable } from './role.schema';
import { userRolesTable, userTable } from './user.schema';

export const rolesRelations = relations(rolesTable, ({ many }) => ({
    users: many(userRolesTable),
}));

export const refreshTokensRelations = relations(refreshTokensTable, ({ one }) => ({
    user: one(userTable, {
        fields: [refreshTokensTable.userId],
        references: [userTable.id],
    }),
}));

export const userRelations = relations(userTable, ({ many, one }) => ({
    roles: many(userRolesTable),
    game: one(gamesTable, {
        fields: [userTable.gameId],
        references: [gamesTable.id],
    }),
    refreshTokens: many(refreshTokensTable),
}));

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
    user: one(userTable, { fields: [userRolesTable.userId], references: [userTable.id] }),
    role: one(rolesTable, { fields: [userRolesTable.roleId], references: [rolesTable.id] }),
}));

export const gamesRelations = relations(gamesTable, ({ many }) => ({
    players: many(userTable),
}));
