import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { customers } from './customers.js'

/**
 * Customer Refresh Tokens table - for customer JWT refresh tokens
 */
export const customerRefreshTokens = pgTable(
  'customer_refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    deviceInfo: varchar('device_info', { length: 500 }), // User agent string
    ipAddress: varchar('ip_address', { length: 50 }),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    customerIdIdx: index('customer_refresh_tokens_customer_id_idx').on(
      table.customerId
    ),
    tokenIdx: index('customer_refresh_tokens_token_idx').on(table.token),
    expiresAtIdx: index('customer_refresh_tokens_expires_at_idx').on(
      table.expiresAt
    )
  })
)

// Type exports
export type CustomerRefreshToken = typeof customerRefreshTokens.$inferSelect
export type NewCustomerRefreshToken = typeof customerRefreshTokens.$inferInsert
