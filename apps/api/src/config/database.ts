import { createDatabase, type Database } from '../db/client.js'
import { env } from './env.js'

/**
 * Database client instance
 */
export const db: Database = createDatabase({
  connectionString: env.DATABASE_URL,
  maxConnections: 20,
  idleTimeout: 30
})

/**
 * Export database type for dependency injection
 */
export type { Database }
