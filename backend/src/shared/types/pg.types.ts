import type { db } from 'database';

export type Queryable = { query: typeof db.query };
