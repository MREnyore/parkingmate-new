import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { users } from './users.js'

/**
 * Parking lots table - stores parking lot information
 */
export const parkingLots = pgTable('parking_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  totalSpaces: integer('total_spaces').notNull(),
  availableSpaces: integer('available_spaces').notNull(),
  pricePerHour: decimal('price_per_hour', {
    precision: 10,
    scale: 2
  }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  openingTime: varchar('opening_time', { length: 5 }), // e.g., "09:00"
  closingTime: varchar('closing_time', { length: 5 }), // e.g., "18:00"
  isOpen247: boolean('is_open_24_7').default(false).notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at')
})

/**
 * Parking spaces table - individual spaces within a parking lot
 */
export const parkingSpaces = pgTable('parking_spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  parkingLotId: uuid('parking_lot_id')
    .references(() => parkingLots.id, { onDelete: 'cascade' })
    .notNull(),
  spaceNumber: varchar('space_number', { length: 50 }).notNull(),
  floor: varchar('floor', { length: 50 }),
  zone: varchar('zone', { length: 50 }),
  type: varchar('type', { length: 50 }).default('standard').notNull(), // 'standard', 'handicapped', 'electric', 'compact'
  isOccupied: boolean('is_occupied').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

/**
 * Parking lot amenities
 */
export const parkingLotAmenities = pgTable('parking_lot_amenities', {
  id: uuid('id').primaryKey().defaultRandom(),
  parkingLotId: uuid('parking_lot_id')
    .references(() => parkingLots.id, { onDelete: 'cascade' })
    .notNull(),
  amenity: varchar('amenity', { length: 100 }).notNull(), // e.g., 'covered', 'security', 'ev_charging', 'valet'
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Type exports
export type ParkingLot = typeof parkingLots.$inferSelect
export type NewParkingLot = typeof parkingLots.$inferInsert
export type ParkingSpace = typeof parkingSpaces.$inferSelect
export type NewParkingSpace = typeof parkingSpaces.$inferInsert
export type ParkingLotAmenity = typeof parkingLotAmenities.$inferSelect
export type NewParkingLotAmenity = typeof parkingLotAmenities.$inferInsert
