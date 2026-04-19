import { cron } from '@elysiajs/cron';
import { db } from 'database';
import { Elysia } from 'elysia';

export const sessionCleanup = new Elysia().use(
    cron({
        name: 'cleanup-expired-sessions',
        pattern: '0 * * * *',
        async run() {
            console.log('[Cron] Cleaning up expired sessions...');
            try {
                const result = await db.query('DELETE FROM "sessions" WHERE expires_at < NOW()');
                console.log(`[Cron] Removed ${result.rowCount} expired sessions.`);
            } catch (error) {
                console.error('[Cron] Session cleanup failed:', error);
            }
        },
    }),
);
