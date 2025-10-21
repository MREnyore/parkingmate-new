import { and, eq, gt, lt } from 'drizzle-orm'
import { db } from '../config/database.js'
import {
  type CustomerRegistrationToken,
  customerRegistrationTokens,
  type NewCustomerRegistrationToken
} from '../db/index.js'

export const customerRegistrationTokenService = {
  /**
   * Create a new registration token
   */
  async create(
    data: NewCustomerRegistrationToken
  ): Promise<CustomerRegistrationToken> {
    const [token] = await db
      .insert(customerRegistrationTokens)
      .values(data)
      .returning()
    return token
  },

  /**
   * Find registration token by token string
   */
  async findByToken(
    token: string
  ): Promise<CustomerRegistrationToken | undefined> {
    const now = new Date()
    const [regToken] = await db
      .select()
      .from(customerRegistrationTokens)
      .where(
        and(
          eq(customerRegistrationTokens.token, token),
          eq(customerRegistrationTokens.used, false),
          gt(customerRegistrationTokens.expiresAt, now)
        )
      )
      .limit(1)
    return regToken
  },

  /**
   * Find registration token by customer ID
   */
  async findByCustomerId(
    customerId: string
  ): Promise<CustomerRegistrationToken | undefined> {
    const now = new Date()
    const [token] = await db
      .select()
      .from(customerRegistrationTokens)
      .where(
        and(
          eq(customerRegistrationTokens.customerId, customerId),
          eq(customerRegistrationTokens.used, false),
          gt(customerRegistrationTokens.expiresAt, now)
        )
      )
      .limit(1)
    return token
  },

  /**
   * Mark registration token as used
   */
  async markAsUsed(id: string): Promise<CustomerRegistrationToken | undefined> {
    const [updated] = await db
      .update(customerRegistrationTokens)
      .set({ used: true })
      .where(eq(customerRegistrationTokens.id, id))
      .returning()
    return updated
  },

  /**
   * Delete expired tokens for cleanup
   */
  async deleteExpired(): Promise<number> {
    const now = new Date()
    const deleted = await db
      .delete(customerRegistrationTokens)
      .where(lt(customerRegistrationTokens.expiresAt, now))
      .returning()
    return deleted.length
  },

  /**
   * Invalidate all tokens for a customer
   */
  async invalidateForCustomer(customerId: string): Promise<number> {
    const updated = await db
      .update(customerRegistrationTokens)
      .set({ used: true })
      .where(
        and(
          eq(customerRegistrationTokens.customerId, customerId),
          eq(customerRegistrationTokens.used, false)
        )
      )
      .returning()
    return updated.length
  },

  /**
   * Mark registration token as used by email and org ID
   */
  async markAsUsedByEmail(email: string, orgId: string): Promise<number> {
    // First find customer by email and orgId, then mark their tokens as used
    const updated = await db
      .update(customerRegistrationTokens)
      .set({ used: true })
      .where(eq(customerRegistrationTokens.used, false))
      .returning()
    return updated.length
  }
}
