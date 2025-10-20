import { createDatabase, type Database } from '../db/client'
import { env } from './env'

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
