import { db } from 'src/database/data-source';

export type Queryable = { query: typeof db.query };
