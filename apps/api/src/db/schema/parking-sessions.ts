import {
  decimal,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { cameraEvents } from './camera-events.js'
import { cars } from './cars.js'
import { customers } from './customers.js'
import { organizations } from './organizations.js'
import { parkingLots } from './parking.js'

/**
 * Parking session status enum
 */
export const parkingSessionStatusEnum = pgEnum('parking_session_status', [
  'active',
  'completed',
  'expired',
  'penalized'
])

/**
 * Parking Sessions table - Active/completed parking tracking
 */
export const parkingSessions = pgTable('parking_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  carId: uuid('car_id').references(() => cars.id),
  customerId: uuid('customer_id').references(() => customers.id),
  parkingLotId: uuid('parking_lot_id').references(() => parkingLots.id),
  entryEventId: uuid('entry_event_id').references(() => cameraEvents.id),
  exitEventId: uuid('exit_event_id').references(() => cameraEvents.id),
  entryTime: timestamp('entry_time').notNull(),
  exitTime: timestamp('exit_time'),
  status: parkingSessionStatusEnum('status').default('active').notNull(),
  penaltyAmount: decimal('penalty_amount', { precision: 10, scale: 2 }).default(
    '0.00'
  ),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Type exports
export type ParkingSession = typeof parkingSessions.$inferSelect
export type NewParkingSession = typeof parkingSessions.$inferInsert
export type ParkingSessionStatus =
  (typeof parkingSessionStatusEnum.enumValues)[number]
