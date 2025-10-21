import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { customers } from './customers.js'
import { organizations } from './organizations.js'

/**
 * Cars table - Vehicle management with license plates
 */
export const cars = pgTable('cars', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  ownerId: uuid('owner_id')
    .references(() => customers.id, { onDelete: 'cascade' })
    .notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull(),
  label: varchar('label', { length: 100 }), // e.g., "Work Car", "Personal Car"
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Type exports
export type Car = typeof cars.$inferSelect
export type NewCar = typeof cars.$inferInsert
