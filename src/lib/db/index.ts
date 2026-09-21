import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database client singleton for server-side queries.
 * Safe fallback for environments where DATABASE_URL is not configured yet (e.g. CI/static builds).
 */
const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? postgres(connectionString, { max: 10, idle_timeout: 20 })
  : (null as unknown as ReturnType<typeof postgres>);

export const db = client ? drizzle(client, { schema }) : null;

export * from './schema';
