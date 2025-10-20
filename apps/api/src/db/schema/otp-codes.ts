import {
  boolean,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

/**
 * OTP purpose enum
 */
export const otpPurposeEnum = pgEnum('otp_purpose', ['registration', 'signin'])

/**
 * OTP Codes table - OTP authentication codes
 */
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    code: varchar('code', { length: 6 }).notNull(), // 6-digit numeric code
    expiresAt: timestamp('expires_at').notNull(), // 10 minutes from creation
    used: boolean('used').default(false).notNull(),
    purpose: otpPurposeEnum('purpose').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => ({
    emailCodeIdx: index('otp_codes_email_code_idx').on(table.email, table.code),
    expiresAtIdx: index('otp_codes_expires_at_idx').on(table.expiresAt)
  })
)

// Type exports
export type OtpCode = typeof otpCodes.$inferSelect
export type NewOtpCode = typeof otpCodes.$inferInsert
export type OtpPurpose = (typeof otpPurposeEnum.enumValues)[number]
