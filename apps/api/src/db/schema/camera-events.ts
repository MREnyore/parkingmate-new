import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/**
 * Camera Events table - ALPR event logging
 */
export const cameraEvents = pgTable('camera_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  eventId: varchar('event_id', { length: 255 }), // External camera system event ID
  licensePlate: varchar('license_plate', { length: 20 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  cameraId: varchar('camera_id', { length: 100 }).notNull(),
  locationName: varchar('location_name', { length: 255 }),
  imageBase64: text('image_base64'), // Base64 encoded image
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  direction: varchar('direction', { length: 20 }).notNull(), // 'entry' | 'exit'
  deviceType: varchar('device_type', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Type exports
export type CameraEvent = typeof cameraEvents.$inferSelect
export type NewCameraEvent = typeof cameraEvents.$inferInsert
