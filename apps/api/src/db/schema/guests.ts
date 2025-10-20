import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/**
 * Guest status enum - Guest parking validation status
 */
export const guestStatusEnum = pgEnum('guest_status', [
  'PendingConfirmation',
  'Confirmed',
  'Expired'
])

/**
 * Guests table - Guest parking validation
 */
export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull(),
  status: guestStatusEnum('status').default('PendingConfirmation').notNull(),
  expiresAt: timestamp('expires_at').notNull(), // 30 minutes for pending, 24 hours for confirmed
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Type exports
export type Guest = typeof guests.$inferSelect
export type NewGuest = typeof guests.$inferInsert
export type GuestStatus = (typeof guestStatusEnum.enumValues)[number]
