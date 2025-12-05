import { inspect } from 'node:util';
import { sql } from 'drizzle-orm';
import { situationsTable } from 'src/database';
import { db } from 'src/database/data-source';
import { appDatabase } from './situation-database';

export const seedSituations = async () => {
    try {
        const countResult = await db
            .select({
                count: sql<string>`count(*)`,
            })
            .from(situationsTable);

        const isSituationsEmpty = countResult[0].count === '0';

        if (!isSituationsEmpty) {
            return;
        }

        const situationsToInsert: Array<{ category: string; text: string; isAdult: boolean }> = [];

        Object.values(appDatabase.categories).forEach((cat) => {
            const categoryTitle = cat.title;

            cat.situations.forEach((sit) => {
                situationsToInsert.push({
                    category: categoryTitle,
                    text: sit.text,
                    isAdult: sit.isAdult,
                });
            });
        });

        if (situationsToInsert.length > 0) {
            await db.insert(situationsTable).values(situationsToInsert);
        }
    } catch (error) {
        console.error(inspect(error));
    }
};
