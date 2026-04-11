import type { db } from 'database/data-source';

export type Queryable = { query: typeof db.query };
