import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  connectionString?: string
  maxConnections?: number
  idleTimeout?: number
}

/**
 * Creates a Drizzle database client instance
 */
export const createDatabase = (config: DatabaseConfig) => {
  if (!config.connectionString) {
    throw new Error('Database connection string is required')
  }

  const connectionString = config?.connectionString

  const queryClient = postgres(connectionString, {
    max: config?.maxConnections || 10,
    idle_timeout: config?.idleTimeout || 20,
    connect_timeout: 10
  })

  return drizzle(queryClient, { schema })
}

/**
 * Database client type
 */
export type Database = ReturnType<typeof createDatabase>
