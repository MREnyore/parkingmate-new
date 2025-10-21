import { and, eq, gt, lt } from 'drizzle-orm'
import { db } from '../config/database.js'
import { type NewOtpCode, type OtpCode, otpCodes } from '../db/index.js'

export const otpCodeService = {
  /**
   * Create a new OTP code
   */
  async create(data: NewOtpCode): Promise<OtpCode> {
    const [otpCode] = await db.insert(otpCodes).values(data).returning()
    return otpCode
  },

  /**
   * Find OTP code by email and code
   */
  async findByEmailAndCode(
    email: string,
    code: string
  ): Promise<OtpCode | undefined> {
    const now = new Date()
    const [otpCode] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gt(otpCodes.expiresAt, now)
        )
      )
      .limit(1)
    return otpCode
  },

  /**
   * Mark OTP code as used
   */
  async markAsUsed(id: string): Promise<OtpCode | undefined> {
    const [updated] = await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, id))
      .returning()
    return updated
  },

  /**
   * Delete old/expired OTP codes for cleanup
   */
  async deleteExpired(): Promise<number> {
    const now = new Date()
    const deleted = await db
      .delete(otpCodes)
      .where(lt(otpCodes.expiresAt, now))
      .returning()
    return deleted.length
  },

  /**
   * Invalidate all OTP codes for an email
   */
  async invalidateForEmail(email: string): Promise<number> {
    const updated = await db
      .update(otpCodes)
      .set({ used: true })
      .where(and(eq(otpCodes.email, email), eq(otpCodes.used, false)))
      .returning()
    return updated.length
  }
}
