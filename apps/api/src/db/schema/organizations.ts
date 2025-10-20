import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * Organization status enum
 */
export const organizationStatusEnum = pgEnum('organization_status', [
  'active',
  'inactive'
])

/**
 * Organizations table - Multi-tenant support
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  status: organizationStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Type exports
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationStatus =
  (typeof organizationStatusEnum.enumValues)[number]
