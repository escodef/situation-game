import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';

export const refreshTokensTable = pgTable('refresh_tokens', {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }),
    token: varchar().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
