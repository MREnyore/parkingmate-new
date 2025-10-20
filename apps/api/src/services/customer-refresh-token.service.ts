import { and, eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  type CustomerRefreshToken,
  customerRefreshTokens,
  type NewCustomerRefreshToken
} from '../db'

export const customerRefreshTokenService = {
  /**
   * Create a new refresh token
   */
  async create(data: NewCustomerRefreshToken): Promise<CustomerRefreshToken> {
    const [refreshToken] = await db
      .insert(customerRefreshTokens)
      .values(data)
      .returning()
    return refreshToken
  },

  /**
   * Find refresh token by token string
   */
  async findByToken(token: string): Promise<CustomerRefreshToken | undefined> {
    const _now = new Date()
    const [refreshToken] = await db
      .select()
      .from(customerRefreshTokens)
      .where(
        and(
          eq(customerRefreshTokens.token, token),
          eq(customerRefreshTokens.isRevoked, false)
        )
      )
      .limit(1)
    return refreshToken
  },

  /**
   * Revoke a refresh token
   */
  async revoke(id: string): Promise<CustomerRefreshToken | undefined> {
    const [updated] = await db
      .update(customerRefreshTokens)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(customerRefreshTokens.id, id))
      .returning()
    return updated
  },

  /**
   * Revoke refresh token by token string
   */
  async revokeByToken(
    token: string
  ): Promise<CustomerRefreshToken | undefined> {
    const [updated] = await db
      .update(customerRefreshTokens)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(customerRefreshTokens.token, token))
      .returning()
    return updated
  },

  /**
   * Delete expired refresh tokens for cleanup
   */
  async deleteExpired(): Promise<number> {
    const _now = new Date()
    const deleted = await db
      .delete(customerRefreshTokens)
      .where(eq(customerRefreshTokens.isRevoked, true))
      .returning()
    return deleted.length
  }
}
