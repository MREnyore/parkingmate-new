import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

/**
 * Customer status enum - Account status
 */
export const customerStatusEnum = pgEnum('customer_status', [
  'active',
  'inactive'
])

/**
 * Membership status enum - Subscription/membership state
 */
export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'expired',
  'cancelled'
])

/**
 * Customers table - Customer accounts with OTP authentication
 */
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }),
  registered: boolean('registered').default(false).notNull(),
  status: customerStatusEnum('status').default('active').notNull(),
  membershipStatus: membershipStatusEnum('membership_status'),
  membershipExpiryDate: timestamp('membership_expiry_date'),
  address: varchar('address', { length: 500 }),
  postalCode: varchar('postal_code', { length: 20 }),
  city: varchar('city', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Type exports
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type CustomerStatus = (typeof customerStatusEnum.enumValues)[number]
export type MembershipStatus = (typeof membershipStatusEnum.enumValues)[number]
