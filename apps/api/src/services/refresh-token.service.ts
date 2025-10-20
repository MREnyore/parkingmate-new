import { and, eq, gt, isNull, lt } from 'drizzle-orm'
import { db } from '../config/database'
import { type NewRefreshToken, type RefreshToken, refreshTokens } from '../db'

export const refreshTokenService = {
  /**
   * Create a new refresh token
   */
  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await db.insert(refreshTokens).values(data).returning()
    return token
  },

  /**
   * Find refresh token by token string
   */
  async findByToken(token: string): Promise<RefreshToken | undefined> {
    const now = new Date()
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          gt(refreshTokens.expiresAt, now),
          isNull(refreshTokens.revokedAt)
        )
      )
      .limit(1)
    return refreshToken
  },

  /**
   * Find all active tokens for a user
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const now = new Date()
    return db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          gt(refreshTokens.expiresAt, now),
          isNull(refreshTokens.revokedAt)
        )
      )
  },

  /**
   * Revoke a refresh token
   */
  async revoke(token: string): Promise<RefreshToken | undefined> {
    const [revoked] = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token))
      .returning()
    return revoked
  },

  /**
   * Revoke all tokens for a user
   */
  async revokeAllForUser(userId: string): Promise<number> {
    const revoked = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt))
      )
      .returning()
    return revoked.length
  },

  /**
   * Delete expired tokens for cleanup
   */
  async deleteExpired(): Promise<number> {
    const now = new Date()
    const deleted = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now))
      .returning()
    return deleted.length
  }
}
