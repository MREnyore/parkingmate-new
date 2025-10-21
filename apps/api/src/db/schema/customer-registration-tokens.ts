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
 * Customer Registration Tokens table - Customer registration flow tokens
 */
export const customerRegistrationTokens = pgTable(
  'customer_registration_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(), // 48 hours from creation
    used: boolean('used').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => ({
    tokenIdx: index('customer_registration_tokens_token_idx').on(table.token)
  })
)

// Type exports
export type CustomerRegistrationToken =
  typeof customerRegistrationTokens.$inferSelect
export type NewCustomerRegistrationToken =
  typeof customerRegistrationTokens.$inferInsert
